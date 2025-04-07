import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Audio } from "expo-av";

const PlayerContext = createContext();

// Helper function to calculate next index (moved outside component)
const calculateNextIndex = (
  currentIndex,
  playlistLength,
  shuffleActive,
  loopMode,
  history,
  shuffledIndexes
) => {
  if (playlistLength === 0) return null;

  if (shuffleActive) {
    const historySet = new Set(history);

    // If all songs played and loop is enabled
    if (historySet.size >= playlistLength && loopMode === 1) {
      return shuffledIndexes[1]; // Start new shuffle cycle
    }

    // Find first unplayed song in shuffled order
    const nextIndex = shuffledIndexes.find((idx) => !historySet.has(idx));
    return nextIndex !== undefined ? nextIndex : null;
  } else {
    // Sequential playback
    if (currentIndex < playlistLength - 1) {
      return currentIndex + 1;
    } else if (loopMode === 1) {
      return 0; // Loop to start
    }
    return null; // End of playlist
  }
};

// Helper function for previous index calculation
const calculatePreviousIndex = (
  currentIndex,
  playlistLength,
  shuffleActive,
  loopMode,
  history
) => {
  if (shuffleActive) {
    return history.length > 1 ? history[history.length - 2] : null;
  } else {
    if (currentIndex > 0) return currentIndex - 1;
    if (loopMode === 1) return playlistLength - 1;
    return null;
  }
};

export const PlayerProvider = ({ children }) => {
  // State declarations
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffledIndexes, setShuffledIndexes] = useState([]);
  const [history, setHistory] = useState([]);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [loopMode, setLoopMode] = useState(0); // 0: no loop, 1: loop playlist, 2: loop one
  const [isLoading, setIsLoading] = useState(false);
  const [isSongEnded, setIsSongEnded] = useState(false);

  // Refs
  const soundRef = useRef(null);
  const lastPlayedUri = useRef(null);
  const isMounted = useRef(true);

  // Setup audio mode
  useEffect(() => {
    const setupAudioMode = async () => {
      try {
        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          mixingWithOthers: false,
        });

        // Setup notification/controls
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("audio_playback", {
            name: "Audio Playback",
            importance: Notifications.AndroidImportance.MAX,
            sound: "default",
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }
      } catch (error) {
        console.error("Background audio setup failed:", error);
      }
    };

    return () => {
      isMounted.current = false;
      unloadSound();
    };
  }, []);

  // Generate shuffled indexes
  const generateShuffledIndexes = useCallback((playlistLength, currentIdx) => {
    const indexes = Array.from({ length: playlistLength }, (_, i) => i)
      .filter((i) => i !== currentIdx)
      .sort(() => Math.random() - 0.5);

    if (currentIdx !== null && currentIdx >= 0 && currentIdx < playlistLength) {
      indexes.unshift(currentIdx);
    }

    return indexes;
  }, []);

  useEffect(() => {
    if (shuffleActive && playlist.length > 0 && shuffledIndexes.length === 0) {
      const newShuffledIndexes = generateShuffledIndexes(
        playlist.length,
        currentIndex
      );
      setShuffledIndexes(newShuffledIndexes);
      setHistory([currentIndex]);
    }
  }, [
    shuffleActive,
    playlist.length,
    currentIndex,
    generateShuffledIndexes,
    shuffledIndexes.length,
  ]);

  // Safe unload function
  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }
      } catch (error) {
        console.error("Error unloading sound:", error);
      }
      soundRef.current = null;
    }
  }, []);

  // Playback status update handler
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) return;

    if (status.durationMillis) {
      setDuration((prev) => {
        const newDuration = status.durationMillis / 1000;
        return Math.abs(newDuration - prev) > 0.1 ? newDuration : prev;
      });
    }

    if (status.positionMillis >= 0) {
      const newPosition = status.positionMillis / 1000;
      setPosition((prev) =>
        Math.abs(newPosition - prev) > 0.1 ? newPosition : prev
      );

      if (status.durationMillis > 0) {
        const newProgress = status.positionMillis / status.durationMillis;
        setProgress((prev) =>
          Math.abs(newProgress - prev) > 0.001 ? newProgress : prev
        );
      }
    }

    if (status.didJustFinish && isMounted.current) {
      setIsSongEnded(true);
    }
  }, []);

  // Load sound when currentSong changes
  useEffect(() => {
    if (!currentSong?.song_url) return;

    const loadSound = async () => {
      if (isLoading || lastPlayedUri.current === currentSong.song_url) return;
      setIsLoading(true);

      try {
        await unloadSound();

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSong.song_url },
          { shouldPlay: isPlaying },
          onPlaybackStatusUpdate
        );

        soundRef.current = newSound;
        lastPlayedUri.current = currentSong.song_url;

        const status = await newSound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setDuration(status.durationMillis / 1000);
        }
      } catch (error) {
        console.error("Error loading sound:", error);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    loadSound();
  }, [currentSong, isPlaying, onPlaybackStatusUpdate, unloadSound, isLoading]);

  // Control playback when isPlaying changes
  useEffect(() => {
    if (!soundRef.current || isLoading) return;

    const updatePlayback = async () => {
      try {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) return;

        if (isPlaying && !status.isPlaying) {
          await soundRef.current.playAsync();
        } else if (!isPlaying && status.isPlaying) {
          await soundRef.current.pauseAsync();
        }
      } catch (error) {
        console.error("Playback control error:", error);
      }
    };

    updatePlayback();
  }, [isPlaying, isLoading]);

  // Handle song ending
  useEffect(() => {
    if (!isSongEnded) return;

    const handleSongEnd = async () => {
      setIsSongEnded(false);

      if (loopMode === 2) {
        // Loop current song
        try {
          if (soundRef.current) {
            await soundRef.current.replayAsync();
          }
        } catch (error) {
          console.error("Error replaying song:", error);
        }
      } else {
        // Play next song
        const nextIndex = calculateNextIndex(
          currentIndex,
          playlist.length,
          shuffleActive,
          loopMode,
          history,
          shuffledIndexes
        );

        if (nextIndex !== null) {
          setCurrentSong(playlist[nextIndex]);
          setCurrentIndex(nextIndex);
          if (shuffleActive) {
            setHistory((prev) => [...prev, nextIndex]);
          }
        } else {
          setIsPlaying(false);
        }
      }
    };

    handleSongEnd();
  }, [
    isSongEnded,
    loopMode,
    currentIndex,
    playlist,
    shuffleActive,
    history,
    shuffledIndexes,
  ]);

  // Play song function
  const playSong = useCallback(
    (song, allSongs, index) => {
      if (isLoading) return;

      // If same song is selected, just toggle play/pause
      if (currentSong?.song_url === song.song_url) {
        setIsPlaying((prev) => !prev);
        return;
      }

      // Update player state
      setCurrentSong(song);
      setPlaylist(allSongs);
      setCurrentIndex(index);
      setIsPlaying(true);
      setPosition(0);
      setProgress(0);

      // Update history if shuffle is active
      if (shuffleActive) {
        setHistory((prev) => [...prev, index]);
      }
    },
    [currentSong, isLoading, shuffleActive]
  );

  // Play next song
  const playNext = useCallback(() => {
    const nextIndex = calculateNextIndex(
      currentIndex,
      playlist.length,
      shuffleActive,
      loopMode,
      history,
      shuffledIndexes
    );

    if (nextIndex !== null) {
      playSong(playlist[nextIndex], playlist, nextIndex);
    } else {
      setIsPlaying(false);
    }
  }, [
    currentIndex,
    playlist,
    shuffleActive,
    loopMode,
    history,
    shuffledIndexes,
    playSong,
  ]);

  // Play previous song
  const playPrevious = useCallback(() => {
    const prevIndex = calculatePreviousIndex(
      currentIndex,
      playlist.length,
      shuffleActive,
      loopMode,
      history
    );

    if (prevIndex !== null) {
      playSong(playlist[prevIndex], playlist, prevIndex);
    }
  }, [currentIndex, playlist, shuffleActive, loopMode, history, playSong]);

  // Seek function
  const seekTo = useCallback(
    async (value) => {
      if (!soundRef.current || isLoading) return;

      try {
        const newPosition = value * duration * 1000;
        await soundRef.current.setPositionAsync(newPosition);
        setPosition(newPosition / 1000);
        setProgress(value);
      } catch (error) {
        console.error("Seek error:", error);
      }
    },
    [duration, isLoading]
  );

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setShuffleActive((prev) => {
      const newState = !prev;
      if (newState && playlist.length > 0) {
        setShuffledIndexes(
          generateShuffledIndexes(playlist.length, currentIndex)
        );
        setHistory([currentIndex]);
      }
      return newState;
    });
  }, [playlist.length, currentIndex, generateShuffledIndexes]);

  // Toggle loop mode
  const toggleLoopMode = useCallback(() => {
    setLoopMode((prev) => (prev + 1) % 3);
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }, []);

  // Context value
  const contextValue = useMemo(
    () => ({
      currentSong,
      playlist,
      currentIndex,
      isPlaying,
      position,
      duration,
      progress,
      shuffleActive,
      loopMode,
      isLoading,
      playSong,
      playNext,
      playPrevious,
      setIsPlaying,
      seekTo,
      toggleShuffle,
      toggleLoopMode,
      formatTime,
    }),
    [
      currentSong,
      playlist,
      currentIndex,
      isPlaying,
      position,
      duration,
      progress,
      shuffleActive,
      loopMode,
      isLoading,
      playSong,
      playNext,
      playPrevious,
      seekTo,
      toggleShuffle,
      toggleLoopMode,
      formatTime,
    ]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
