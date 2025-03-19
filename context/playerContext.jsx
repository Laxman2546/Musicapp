import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Audio } from "expo-av";
const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Add these new states for audio tracking
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [loopMode, setLoopMode] = useState(0); // 0: no loop, 1: loop playlist, 2: loop one

  // Reference to track intervals
  const positionUpdateInterval = useRef(null);

  // Configure audio mode once when component mounts
  useEffect(() => {
    const setupAudioMode = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });
    };

    setupAudioMode();
  }, []);

  // Monitor playback status
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      // Update duration and position without causing renders if values haven't changed
      if (
        status.durationMillis &&
        Math.abs(status.durationMillis / 1000 - duration) > 0.1
      ) {
        setDuration(status.durationMillis / 1000);
      }

      if (status.positionMillis >= 0) {
        const newPosition = status.positionMillis / 1000;
        if (Math.abs(newPosition - position) > 0.1) {
          setPosition(newPosition);
        }

        if (status.durationMillis > 0) {
          const newProgress = status.positionMillis / status.durationMillis;
          if (Math.abs(newProgress - progress) > 0.001) {
            setProgress(newProgress);
          }
        }
      }

      if (status.didJustFinish) {
        handleSongEnd();
      }
    }
  };

  // Load sound when currentSong changes
  useEffect(() => {
    if (!currentSong) return;

    const loadSound = async () => {
      if (sound) {
        await sound.unloadAsync();
        clearInterval(positionUpdateInterval.current);
      }

      try {
        console.log("Attempting to load sound from:", currentSong.song_url);
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSong.song_url },
          { shouldPlay: isPlaying },
          onPlaybackStatusUpdate
        );

        setSound(newSound);

        // Get initial status to set duration immediately
        const initialStatus = await newSound.getStatusAsync();
        if (initialStatus.isLoaded && initialStatus.durationMillis) {
          setDuration(initialStatus.durationMillis / 1000);
        }
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [currentSong]);

  // Control playback based on isPlaying state
  useEffect(() => {
    if (!sound) return;

    const controlPlayback = async () => {
      try {
        if (isPlaying) {
          await sound.playAsync();
        } else {
          await sound.pauseAsync();
        }
      } catch (error) {
        console.error("Playback control error:", error);
      }
    };

    controlPlayback();
  }, [isPlaying, sound]);

  // Handle what happens when a song ends
  const handleSongEnd = () => {
    if (loopMode === 2) {
      sound.replayAsync();
    } else {
      if (currentIndex < playlist.length - 1) {
        playNext();
      } else if (loopMode === 1) {
        playSong(playlist[0], playlist, 0);
      } else {
        // End of playlist, stop playing
        setIsPlaying(false);
      }
    }
  };

  // Play a specific song
  const playSong = (song, allSongs, index) => {
    console.log(allSongs, "allsongs");
    setCurrentSong(song);
    setPlaylist(allSongs);
    setCurrentIndex(index);
    setIsPlaying(true);
    setPosition(0);
    setProgress(0);
  };

  // Play next song
  const playNext = () => {
    if (shuffleActive) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playSong(playlist[randomIndex], playlist, randomIndex);
    } else if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSong(playlist[currentIndex + 1]);
    }
  };

  // Play previous song
  const playPrevious = () => {
    if (shuffleActive) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playSong(playlist[randomIndex], playlist, randomIndex);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentSong(playlist[currentIndex - 1]);
    }
  };

  // Seek to position
  const seekTo = async (value) => {
    if (!sound) return;

    try {
      const newPosition = value * duration * 1000;
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition / 1000);
      setProgress(value);
    } catch (error) {
      console.error("Seek error:", error);
    }
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    setShuffleActive(!shuffleActive);
  };

  // Toggle loop mode
  const toggleLoopMode = () => {
    setLoopMode((prevMode) => (prevMode + 1) % 3);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        playlist,
        currentIndex,
        isPlaying,
        position,
        duration,
        progress,
        shuffleActive,
        loopMode,
        playSong,
        playNext,
        playPrevious,
        setIsPlaying,
        seekTo,
        toggleShuffle,
        toggleLoopMode,
        formatTime: (seconds) => {
          if (!seconds) return "00:00";
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = Math.floor(seconds % 60);
          return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
          ).padStart(2, "0")}`;
        },
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
