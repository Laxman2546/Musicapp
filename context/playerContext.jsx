// contexts/PlayerContext.js (updated)
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
  console.log("this is duration", duration);
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

        // Start position tracking
        positionUpdateInterval.current = setInterval(updatePosition, 1000);
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

  // Update position and progress
  const updatePosition = async () => {
    if (!sound) return;

    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setPosition(status.positionMillis / 1000);
        setDuration(status.durationMillis / 1000);
        setProgress(status.positionMillis / status.durationMillis);
      }
    } catch (error) {
      console.error("Error updating position:", error);
    }
  };

  // Monitor playback status
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        handleSongEnd();
      }
    }
  };

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
