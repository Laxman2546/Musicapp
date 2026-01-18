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
              alwaysPauseOnInterruption: true,
            },
            compactCapabilities: [
              Capability.Play,
              Capability.Pause,
              Capability.SkipToNext,
              Capability.SkipToPrevious,
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

  // Main function to play a song
  const playSong = useCallback(
    async (song, allSongs, index) => {
      try {
        // Set loading ONLY when starting to play a new song
        setLoading(true);

        let tracks = allSongs
          .map((songItem) => {
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
            console.log("this is a song item", songItem);
            return {
              ...songItem,
              id,
              url:
                songItem.song_url ||
                songItem.media_url ||
                songItem.filePath ||
                songItem.downloadUrl[4].url ||
                songItem.downloadUrl[3].url ||
                "",
              title:
                cleanSongName(songItem.name || songItem.song) ||
                "Unknown Title",
              artist:
                songItem.primary_artists ||
                (songItem.artists && songItem.artists.primary
                  ? songItem.artists.primary.map((a) => a.name).join(", ")
                  : null) ||
                songItem.music ||
                "Unknown Artist",
              artwork: artworkUrl,
              notificationCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
              ],
            };
          })
          .filter((track) => track.url);

        // Check if same song is already playing - if so, just navigate to player
        if (
          currentSong &&
          currentSong.id &&
          song.id &&
          currentSong.id === song.id
        ) {
          setLoading(false); // Clear loading since we're not actually loading
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
          setLoading(false); // Clear loading since we're not actually loading
          navigateToPlayer();
          return;
        }

        if (tracks.length === 0) {
          console.error("No valid tracks to play");
          setLoading(false);
          return;
        }
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
        }
        // Create a mapping of track IDs to their indices
        updateTrackIndexMap(tracks);

        // Update local state BEFORE TrackPlayer operations
        const selectedTrack = tracks[index];
        setCurrentSong(selectedTrack);
        setPlaylist(tracks);
        setCurrentIndex(index);

        // Reset and setup TrackPlayer queue
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);

        // Skip to the correct track (this is crucial!)
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
        }
      } catch (error) {
        console.error("Error handling TrackPlayer event:", error);
      }
    },
  );

  // Play next song
  const playNext = useCallback(async () => {
    try {
      if (shuffleActive && playlist.length > 1) {
        // Shuffle logic - pick random track except current
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentIndex);

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
      const currentPosition = await TrackPlayer.getPosition();
      const queue = await TrackPlayer.getQueue();

      // If more than 3 seconds into the song, restart current song
      if (currentPosition > 3) {
        await TrackPlayer.seekTo(0);
      } else {
        // Calculate previous index with wrap-around
        const previousIndex =
          currentIndex > 0 ? currentIndex - 1 : queue.length - 1;
        await TrackPlayer.skip(previousIndex);
        await TrackPlayer.play();
      }
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
        await TrackPlayer.reset();
        await TrackPlayer.add(shuffledQueue);
        await TrackPlayer.skip(currentTrackIndex);
        await TrackPlayer.seekTo(currentPosition);
        if (wasPlaying) {
          await TrackPlayer.play();
        }
      } else if (!newShuffleState) {
        const newIndex = playlist.findIndex(
          (t) => t.id === currentTrackObject.id,
        );

        updateTrackIndexMap(playlist);
        await TrackPlayer.reset();
        await TrackPlayer.add(playlist);

        if (newIndex !== -1) {
          await TrackPlayer.skip(newIndex);
          await TrackPlayer.seekTo(currentPosition);
        } else {
          await TrackPlayer.skip(0);
          await TrackPlayer.seekTo(0);
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
    ],
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
