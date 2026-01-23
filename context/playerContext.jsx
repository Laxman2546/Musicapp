import { router, useFocusEffect } from "expo-router";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import he from "he";
import AsyncStorage from "@react-native-async-storage/async-storage";
const PlayerContext = createContext();

// Navigation lock to prevent multiple rapid navigations
let isNavigating = false;
const navigateToPlayer = () => {
  if (isNavigating) return;
  isNavigating = true;
  router.push("/player");
  // Reset the lock after a short delay
  setTimeout(() => {
    isNavigating = false;
  }, 1000); // 1 second cooldown
};

// Generate a unique ID for each song
const generateUniqueId = (song, artists, duration) => {
  const artistStr =
    typeof artists === "string"
      ? artists
      : Array.isArray(artists)
        ? artists.join("_")
        : "unknown";

  const songName = typeof song === "string" ? song : "unknown";

  return `${songName
    .replace(/[^a-z0-9\-_ ]/gi, "")
    .replace(/\s+/g, "_")}_${artistStr
    .replace(/[^a-z0-9\-_ ]/gi, "")
    .replace(/\s+/g, "_")}_${duration || 0}`;
};

const cleanSongName = (name) => {
  if (!name) return "Unknown";

  const decodedName = he.decode(name);
  const songName = decodedName.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  console.log(songName);
  return songName;
};

// Helper function to transform a single song to track format
const transformSongToTrack = (songItem) => {
  // Generate a unique ID for this song if it doesn't already have one
  const id =
    songItem.id ||
    generateUniqueId(
      songItem.song || songItem.name || songItem.title,
      songItem.primary_artists || songItem.artist,
      songItem.duration,
    );

  // Improved image handling logic
  let artworkUrl = null;

  // Case 1: Direct image URL as string
  if (
    typeof songItem.image === "string" &&
    (songItem.image.startsWith("file://") ||
      songItem.image.startsWith("http://") ||
      songItem.image.startsWith("https://") ||
      songItem.image.startsWith("content://"))
  ) {
    artworkUrl = songItem.image;
  }
  // Case 2: Image is an array with objects containing URLs (from search API)
  else if (Array.isArray(songItem.image)) {
    // Try to get highest quality image (usually at index 2)
    if (songItem.image[2] && songItem.image[2].url) {
      artworkUrl = songItem.image[2].url;
    }
    // Fallback to any available image in the array
    else {
      for (let i = 0; i < songItem.image.length; i++) {
        if (songItem.image[i] && songItem.image[i].url) {
          artworkUrl = songItem.image[i].url;
          break;
        }
      }
    }
  }

  // Convert duration from seconds to milliseconds if it's a number
  let duration = songItem.duration;
  if (songItem.isRadio) {
    duration = 0;
  } else if (typeof duration === "string") {
    const parsedDuration = parseInt(duration, 10);
    duration = isNaN(parsedDuration) ? 0 : parsedDuration * 1000;
  } else if (typeof duration === "number") {
    duration = duration * 1000;
  } else {
    duration = 0;
  }

  return {
    ...songItem,
    id,
    url:
      songItem.song_url ||
      songItem.media_url ||
      songItem.filePath ||
      (Array.isArray(songItem.downloadUrl) && songItem.downloadUrl[4]?.url) ||
      (Array.isArray(songItem.downloadUrl) && songItem.downloadUrl[3]?.url) ||
      "",
    title: cleanSongName(songItem.name || songItem.song) || "Unknown Title",
    artist:
      songItem.primary_artists ||
      (songItem.artists && songItem.artists.primary
        ? songItem.artists.primary.map((a) => a.name).join(", ")
        : null) ||
      songItem.music ||
      "Unknown Artist",
    artwork: artworkUrl,
    duration: duration,
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
  };
};

// Helper function to batch transform songs
const transformSongsInBatches = (songs, batchSize = 50) => {
  const transformed = [];
  for (let i = 0; i < songs.length; i += batchSize) {
    const batch = songs.slice(i, i + batchSize);
    transformed.push(...batch.map(transformSongToTrack).filter((t) => t.url));
  }
  return transformed;
};

export const PlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [loopMode, setLoopMode] = useState(RepeatMode.Off);
  const [currentSong, setCurrentSong] = useState(null);
  const [shuffleToggle, setShuffleToggle] = useState(false);
  const [showVolume, setShowvolume] = useState(false);
  const [showSongLyrics, setshowSongLyrics] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [trackIndexMap, setTrackIndexMap] = useState({}); // Map track IDs to their queue index
  const [isDucked, setIsDucked] = useState(false); // Track ducking state
  const [previousVolume, setPreviousVolume] = useState(1); // Store volume before ducking
  const [allSongsData, setAllSongsData] = useState([]); // Store transformed tracks
  const [queueSize, setQueueSize] = useState(20); // Number of songs to load at a time
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]); // Store shuffled order to prevent repeats

  // Initialize TrackPlayer
  useEffect(() => {
    const setupTrackPlayer = async () => {
      try {
        const isSetup = await TrackPlayer.isServiceRunning();
        if (!isSetup) {
          await TrackPlayer.setupPlayer();
          await TrackPlayer.updateOptions({
            stopWithApp: false,
            capabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.SeekTo,
            ],
            android: {
              alwaysPauseOnInterruption: false, // Changed to false to handle ducking manually
            },
            compactCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
              Capability.SeekTo,
            ],
          });
        }
      } catch (error) {
        console.error("Error setting up TrackPlayer:", error);
      }
    };

    setupTrackPlayer();

    return () => {};
  }, []);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const shuffle = await AsyncStorage.getItem("shuffle");
        if (shuffle !== null) {
          const shuffleValue = JSON.parse(shuffle);
          setShuffleToggle(shuffleValue);
          setShuffleActive(shuffleValue);
        }

        const volume = await AsyncStorage.getItem("showVolume");
        if (volume !== null) setShowvolume(JSON.parse(volume));

        const lyrics = await AsyncStorage.getItem("showSongLyrics");
        if (lyrics !== null) setshowSongLyrics(JSON.parse(lyrics));
      } catch (e) {
        console.log("Failed to load settings", e);
      }
    };
    loadSettings();
  }, []);

  const updateShuffle = async (value) => {
    try {
      await AsyncStorage.setItem("shuffle", JSON.stringify(value));
    } catch (e) {
      console.log(e, "error while saving shuffle");
    }
  };

  const updateShowVolume = async (value) => {
    try {
      await AsyncStorage.setItem("showVolume", JSON.stringify(value));
    } catch (e) {
      console.log(e, "error while saving volume");
    }
  };
  const updateShowSongLyrics = async (value) => {
    try {
      await AsyncStorage.setItem("showSongLyrics", JSON.stringify(value));
    } catch (e) {
      console.log(e, "error while saving lyrics");
    }
  };

  const handleShowVolume = useCallback(() => {
    const newValue = !showVolume;
    setShowvolume(newValue);
    updateShowVolume(newValue);
  }, [showVolume]);

  const handleShowSongLyrics = useCallback(() => {
    const newValue = !showSongLyrics;
    setshowSongLyrics(newValue);
    updateShowSongLyrics(newValue);
  }, [showSongLyrics]);
  useEffect(() => {
    const updatePlaybackState = async () => {
      try {
        if (playbackState === State.Playing) {
          setIsPlaying(true);
        } else if (
          playbackState === State.Paused ||
          playbackState === State.Stopped
        ) {
          setIsPlaying(false);
        }
      } catch (error) {
        console.error("Error updating playback state:", error);
      }
    };
    updatePlaybackState();
  }, [playbackState]);

  // Handle playback position and duration updates
  useEffect(() => {
    if (progress) {
      setPosition(progress.position);
      setDuration(progress.duration);
    }
  }, [progress]);

  // This function creates a mapping of track IDs to their index in the queue
  // This is crucial for managing the correct playback order
  const updateTrackIndexMap = useCallback((tracks) => {
    const indexMap = {};
    tracks.forEach((track, index) => {
      if (track.id) {
        indexMap[track.id] = index;
      }
    });
    setTrackIndexMap(indexMap);
  }, []);

  // Main optimized function to play a song with lazy loading
  const playSong = useCallback(
    async (song, allSongs, index) => {
      try {
        // Set loading ONLY when starting to play a new song
        setLoading(true);

        // Store all songs for later pagination
        setAllSongsData(allSongs);

        // Transform songs in batches for better performance
        const allTracksTransformed = transformSongsInBatches(allSongs);

        if (allTracksTransformed.length === 0) {
          console.error("No valid tracks to play");
          setLoading(false);
          return;
        }

        let tracks = allTracksTransformed;

        // Check if same song is already playing - if so, just navigate to player
        if (
          currentSong &&
          currentSong.id &&
          song.id &&
          currentSong.id === song.id
        ) {
          setLoading(false);
          navigateToPlayer();
          return;
        }
        if (
          currentSong &&
          !currentSong.id &&
          !song.id &&
          currentSong.title === cleanSongName(song.song || song.name) &&
          currentSong.artist === (song.primary_artists || song.artist)
        ) {
          setLoading(false);
          navigateToPlayer();
          return;
        }

        // Apply shuffle if enabled
        if (shuffleToggle && tracks.length > 1) {
          const currentTrack = tracks[index];
          let shuffledTracks = [...tracks];
          shuffledTracks.splice(index, 1);
          for (let i = shuffledTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledTracks[i], shuffledTracks[j]] = [
              shuffledTracks[j],
              shuffledTracks[i],
            ];
          }
          shuffledTracks.splice(index, 0, currentTrack);
          tracks = shuffledTracks;
          // Store the shuffled order to prevent repeats during skip
          setShuffledPlaylist(shuffledTracks);
        } else {
          // Clear shuffled playlist if not shuffling
          setShuffledPlaylist([]);
        }

        // Create a mapping of track IDs to their indices
        updateTrackIndexMap(tracks);

        // Update local state BEFORE TrackPlayer operations
        const selectedTrack = tracks[index];
        setCurrentSong(selectedTrack);
        setPlaylist(tracks);
        setCurrentIndex(index);
        // Store transformed tracks for dynamic loading
        setAllSongsData(tracks);

        // Reset TrackPlayer
        await TrackPlayer.reset();

        // Add ALL songs to queue
        // This ensures skip indices are always valid
        await TrackPlayer.add(tracks);

        // Skip to the correct track
        await TrackPlayer.skip(index);
        await TrackPlayer.play();

        setIsPlaying(true);

        // Clear loading after everything is set up
        setLoading(false);
      } catch (error) {
        console.error("Error playing song:", error);
        setLoading(false); // Always clear loading on error
      }
    },
    [currentSong, updateTrackIndexMap, shuffleToggle],
  );

  // Handle TrackPlayer events
  useTrackPlayerEvents(
    [
      Event.PlaybackTrackChanged,
      Event.PlaybackQueueEnded,
      Event.PlaybackState,
      Event.RemotePlay,
      Event.RemotePause,
      Event.RemoteNext,
      Event.RemotePrevious,
      Event.RemoteSeek,
      Event.RemoteDuck,
    ],
    async (event) => {
      try {
        if (event.type === Event.PlaybackState) {
          // Update playing state
          setIsPlaying(event.state === State.Playing);
        } else if (
          event.type === Event.PlaybackTrackChanged &&
          event.nextTrack !== null
        ) {
          // Track changed - update current track info
          const nextTrackIndex = event.nextTrack;

          // Update current index to match the actual playing track
          setCurrentIndex(nextTrackIndex);

          const track = await TrackPlayer.getTrack(nextTrackIndex);
          if (track) {
            setCurrentSong(track);
          }
        } else if (event.type === Event.PlaybackQueueEnded) {
          // Queue ended - handle repeat modes
          if (loopMode === RepeatMode.Queue) {
            await TrackPlayer.seekTo(0);
            await TrackPlayer.play();
          } else {
            setIsPlaying(false);
          }
        } else if (event.type === Event.RemotePlay) {
          // Remote play button pressed - just play, don't restart
          await TrackPlayer.play();
          setIsPlaying(true);
        } else if (event.type === Event.RemotePause) {
          // Remote pause button pressed
          await TrackPlayer.pause();
          setIsPlaying(false);
        } else if (event.type === Event.RemoteNext) {
          // Handle remote next button
          await playNext();
        } else if (event.type === Event.RemotePrevious) {
          // Handle remote previous button
          await playPrevious();
        } else if (event.type === Event.RemoteSeek) {
          await TrackPlayer.seekTo(event.position);
          setPosition(event.position);
        } else if (event.type === Event.RemoteDuck) {
          // Handle audio ducking for interruptions (incoming calls, notifications, etc.)
          if (event.paused) {
            // Ducking is being removed (interruption ended)
            // Resume to previous volume and resume playing if it was playing
            const currentState = await TrackPlayer.getState();
            const currentVolume = await TrackPlayer.getVolume();

            // Restore previous volume
            await TrackPlayer.setVolume(previousVolume);
            setIsDucked(false);

            // If music was playing before ducking, resume it
            if (currentState !== State.Playing) {
              await TrackPlayer.play();
              setIsPlaying(true);
            }
            console.log(
              "Audio ducking ended, resuming music at volume:",
              previousVolume,
            );
          } else {
            // Ducking is active (interruption started)
            // Reduce volume but keep playing
            const currentVolume = await TrackPlayer.getVolume();
            setPreviousVolume(currentVolume);

            // Reduce volume to 30% for ducking
            const duckVolume = 0.3;
            await TrackPlayer.setVolume(duckVolume);
            setIsDucked(true);

            console.log(
              "Audio ducking started, volume reduced to:",
              duckVolume,
            );
          }
        }
      } catch (error) {
        console.error("Error handling TrackPlayer event:", error);
      }
    },
  );

  // Helper function to load more songs dynamically (DEPRECATED - kept for reference)
  // No longer needed since we load all songs at once
  const loadMoreSongsToQueue = useCallback(async (targetIndex) => {
    try {
      // All songs are already loaded in queue, no need to add more
      // This function is a safety net in case queue size changes
      const currentQueueSize = (await TrackPlayer.getQueue()).length;

      if (targetIndex >= currentQueueSize) {
        console.warn(
          `Target index ${targetIndex} is beyond current queue size ${currentQueueSize}`,
        );
      }
    } catch (error) {
      console.error("Error checking queue:", error);
    }
  }, []);

  // Play next song
  const playNext = useCallback(async () => {
    try {
      if (shuffleActive && playlist.length > 1) {
        // Use the pre-shuffled playlist to avoid repeats
        // Simply go to next track in the shuffled order
        const nextIndex = (currentIndex + 1) % playlist.length;
        await TrackPlayer.skip(nextIndex);
        await TrackPlayer.play();
      } else {
        // Normal next track logic
        const queue = await TrackPlayer.getQueue();
        const nextIndex = (currentIndex + 1) % queue.length;
        await TrackPlayer.skip(nextIndex);
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error("Error playing next song:", error);
    }
  }, [playlist, currentIndex, shuffleActive]);

  // Play previous song
  const playPrevious = useCallback(async () => {
    try {
      // Always play the previous song
      // If user wants to restart current song, they can use seek/replay button
      const previousIndex =
        currentIndex > 0
          ? currentIndex - 1
          : (await TrackPlayer.getQueue()).length - 1;

      await TrackPlayer.skip(previousIndex);
      await TrackPlayer.play();

      // Update current index state
      setCurrentIndex(previousIndex);
    } catch (error) {
      console.error("Error playing previous song:", error);
    }
  }, [currentIndex]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing) {
        await TrackPlayer.pause();
        setIsPlaying(false);
      } else {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error toggling play/pause:", error);
    }
  }, []);

  // Seek to a specific position
  const seekTo = useCallback(async (value) => {
    try {
      await TrackPlayer.seekTo(value);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }, []);

  const toggleShuffle = useCallback(async () => {
    setLoading(true);
    try {
      const newShuffleState = !shuffleActive;
      setShuffleActive(newShuffleState);
      setShuffleToggle(newShuffleState);
      updateShuffle(newShuffleState);

      const currentTrackIndex = await TrackPlayer.getCurrentTrack();
      if (currentTrackIndex === null) {
        setLoading(false);
        return;
      }

      const queue = await TrackPlayer.getQueue();
      const currentTrackObject = queue[currentTrackIndex];
      const currentPosition = await TrackPlayer.getPosition();
      const wasPlaying = (await TrackPlayer.getState()) === State.Playing;

      if (newShuffleState && queue.length > 1) {
        const currentSong = queue[currentTrackIndex];
        let shuffledQueue = [...queue];
        shuffledQueue.splice(currentTrackIndex, 1);

        for (let i = shuffledQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQueue[i], shuffledQueue[j]] = [
            shuffledQueue[j],
            shuffledQueue[i],
          ];
        }
        shuffledQueue.splice(currentTrackIndex, 0, currentSong);
        updateTrackIndexMap(shuffledQueue);
        // Store the shuffled playlist
        setShuffledPlaylist(shuffledQueue);

        // Load shuffle - add all songs to queue to avoid index bounds issues
        await TrackPlayer.reset();
        await TrackPlayer.add(shuffledQueue);
        await TrackPlayer.skip(currentTrackIndex);
        await TrackPlayer.seekTo(currentPosition);

        // Load remaining in background
        if (shuffledQueue.length > currentTrackIndex + 15) {
          setTimeout(async () => {
            try {
              console.log("Shuffle: Background processing complete");
            } catch (error) {
              console.error("Error processing shuffled tracks:", error);
            }
          }, 100);
        }

        if (wasPlaying) {
          await TrackPlayer.play();
        }
      } else if (!newShuffleState) {
        const newIndex = playlist.findIndex(
          (t) => t.id === currentTrackObject.id,
        );

        updateTrackIndexMap(playlist);
        // Clear shuffled playlist
        setShuffledPlaylist([]);

        // Load un-shuffle - add all songs to avoid index bounds issues
        await TrackPlayer.reset();
        await TrackPlayer.add(playlist);

        if (newIndex !== -1) {
          await TrackPlayer.skip(newIndex);
          await TrackPlayer.seekTo(currentPosition);
        } else {
          await TrackPlayer.skip(0);
          await TrackPlayer.seekTo(0);
        }

        // Load remaining in background
        if (playlist.length > newIndex + 15) {
          setTimeout(async () => {
            try {
              console.log("Un-shuffle: Background processing complete");
            } catch (error) {
              console.error("Error processing un-shuffle tracks:", error);
            }
          }, 100);
        }

        if (wasPlaying) {
          await TrackPlayer.play();
        }
      }
    } catch (error) {
      console.error("Error toggling shuffle:", error);
    } finally {
      setLoading(false);
    }
  }, [playlist, shuffleActive, updateTrackIndexMap]);

  const toggleLoopMode = useCallback(() => {
    setLoopMode((prev) => {
      const nextMode =
        prev === RepeatMode.Off
          ? RepeatMode.Queue
          : prev === RepeatMode.Queue
            ? RepeatMode.Track
            : RepeatMode.Off;
      TrackPlayer.setRepeatMode(nextMode);
      return nextMode;
    });
  }, []);

  useEffect(() => {
    TrackPlayer.setRepeatMode(loopMode);
  }, [loopMode]);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }, []);

  // Check if two songs are the same
  const isSameSong = useCallback((song1, song2) => {
    if (!song1 || !song2) return false;

    // Compare by ID if available
    if (song1.id && song2.id) {
      return song1.id === song2.id;
    }

    const song1Name = song1.song || song1.title || song1.name;
    const song2Name = song2.song || song2.title || song2.name;
    const song1Artist = song1.primary_artists || song1.artist;
    const song2Artist = song2.primary_artists || song2.artist;

    return song1Name === song2Name && song1Artist === song2Artist;
  }, []);

  const contextValue = useMemo(
    () => ({
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      setIsPlaying,
      shuffleActive,
      shuffleToggle,
      handleShowSongLyrics,
      showVolume,
      showSongLyrics,
      handleShowVolume,
      loading,
      loopMode,
      playSong,
      playNext,
      playPrevious,
      togglePlayPause,
      seekTo,
      toggleShuffle,
      toggleLoopMode,
      formatTime,
      duration,
      position,
      isSameSong,
      generateUniqueId,
      navigateToPlayer,
      isDucked, // Audio ducking state
    }),
    [
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      loading,
      shuffleActive,
      shuffleToggle,
      showVolume,
      showSongLyrics,
      loopMode,
      handleShowSongLyrics,
      handleShowVolume,
      playSong,
      playNext,
      playPrevious,
      togglePlayPause,
      seekTo,
      toggleShuffle,
      toggleLoopMode,
      formatTime,
      duration,
      position,
      isSameSong,
      generateUniqueId,
      navigateToPlayer,
      isDucked,
    ],
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
