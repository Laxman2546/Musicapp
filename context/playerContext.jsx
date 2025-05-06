import { router } from "expo-router";
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

const PlayerContext = createContext();

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

export const PlayerProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [loopMode, setLoopMode] = useState(RepeatMode.Off);
  const [currentSong, setCurrentSong] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
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
            compactCapabilities: [Capability.Play, Capability.Pause],
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
        const tracks = allSongs
          .map((songItem) => {
            // Generate a unique ID for this song if it doesn't already have one
            const id =
              songItem.id ||
              generateUniqueId(
                songItem.song || songItem.name || songItem.title,
                songItem.primary_artists || songItem.artist,
                songItem.duration
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
              title: songItem.name || songItem.song || "Unknown Title",
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

        // If attempting to play the exact same song that's already loaded, just navigate to player
        if (
          currentSong &&
          currentSong.id &&
          song.id &&
          currentSong.id === song.id
        ) {
          router.push("/player");
          return;
        }
        if (
          currentSong &&
          !currentSong.id &&
          !song.id &&
          currentSong.title === (song.song || song.name) &&
          currentSong.artist === (song.primary_artists || song.artist)
        ) {
          router.push("/player");
          return;
        }

        if (tracks.length === 0) {
          console.error("No valid tracks to play");
          return;
        }

        // Create a mapping of track IDs to their indices
        updateTrackIndexMap(tracks);

        // Update local state
        setCurrentSong(tracks[index]);
        setPlaylist(tracks);
        setCurrentIndex(index);

        // Reset player and load new tracks
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        await TrackPlayer.skip(index);
        await TrackPlayer.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing song:", error);
      }
    },
    [currentSong, updateTrackIndexMap]
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
          // Remote play button pressed
          setIsPlaying(true);
        } else if (event.type === Event.RemotePause) {
          // Remote pause button pressed
          setIsPlaying(false);
        } else if (event.type === Event.RemoteNext) {
          // Fix for notification next button skipping incorrectly
          // Get current track index and properly move to next
          const currentTrackIndex = await TrackPlayer.getCurrentTrack();
          if (currentTrackIndex !== null) {
            const queue = await TrackPlayer.getQueue();
            const nextIndex = currentTrackIndex + 1;

            if (nextIndex < queue.length) {
              // Skip to next track
              await TrackPlayer.skip(nextIndex);
              const track = await TrackPlayer.getTrack(nextIndex);
              if (track) {
                setCurrentSong(track);
                setCurrentIndex(nextIndex);
              }
            }
          }
        } else if (event.type === Event.RemotePrevious) {
          // Ensure proper previous track handling
          const currentTrackIndex = await TrackPlayer.getCurrentTrack();
          if (currentTrackIndex !== null && currentTrackIndex > 0) {
            const prevIndex = currentTrackIndex - 1;
            await TrackPlayer.skip(prevIndex);
            const track = await TrackPlayer.getTrack(prevIndex);
            if (track) {
              setCurrentSong(track);
              setCurrentIndex(prevIndex);
            }
          }
        }
      } catch (error) {
        console.error("Error handling TrackPlayer event:", error);
      }
    }
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
        setCurrentIndex(nextIndex);
        const track = await TrackPlayer.getTrack(nextIndex);
        setCurrentSong(track);
        await TrackPlayer.play();
      } else {
        // Normal next track logic
        const queue = await TrackPlayer.getQueue();
        const currentTrackIndex = await TrackPlayer.getCurrentTrack();

        if (
          currentTrackIndex !== null &&
          currentTrackIndex < queue.length - 1
        ) {
          const nextIndex = currentTrackIndex + 1;
          await TrackPlayer.skip(nextIndex);
          const track = await TrackPlayer.getTrack(nextIndex);
          if (track) {
            setCurrentSong(track);
            setCurrentIndex(nextIndex);
          }
          await TrackPlayer.play();
        }
      }
    } catch (error) {
      console.error("Error playing next song:", error);
    }
  }, [playlist, currentIndex, shuffleActive]);

  // Play previous song
  const playPrevious = useCallback(async () => {
    try {
      const currentTrackIndex = await TrackPlayer.getCurrentTrack();

      if (currentTrackIndex !== null && currentTrackIndex > 0) {
        const prevIndex = currentTrackIndex - 1;
        await TrackPlayer.skip(prevIndex);
        const track = await TrackPlayer.getTrack(prevIndex);
        if (track) {
          setCurrentSong(track);
          setCurrentIndex(prevIndex);
        }
        await TrackPlayer.play();
      } else {
        // At the beginning of queue, restart current track
        await TrackPlayer.seekTo(0);
      }
    } catch (error) {
      console.error("Error playing previous song:", error);
    }
  }, []);

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

  // Also modify the useEffect that monitors playback state

  // Seek to a specific position
  const seekTo = useCallback(async (value) => {
    try {
      await TrackPlayer.seekTo(value);
    } catch (error) {
      console.error("Error seeking:", error);
    }
  }, []);

  // Toggle shuffle
  const toggleShuffle = useCallback(async () => {
    try {
      setShuffleActive((prev) => !prev);
      const currentTrack = await TrackPlayer.getCurrentTrack();
      const queue = await TrackPlayer.getQueue();
      const currentPosition = await TrackPlayer.getPosition();
      const wasPlaying = (await TrackPlayer.getState()) === State.Playing;

      if (!shuffleActive && queue.length > 1) {
        // Save current track
        const currentSong = queue[currentTrack];
        let shuffledQueue = [...queue];
        shuffledQueue.splice(currentTrack, 1);

        // Fisher-Yates shuffle
        for (let i = shuffledQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledQueue[i], shuffledQueue[j]] = [
            shuffledQueue[j],
            shuffledQueue[i],
          ];
        }

        // Put current song back at current position
        shuffledQueue.splice(currentTrack, 0, currentSong);

        // Update track index mapping with new order
        updateTrackIndexMap(shuffledQueue);

        // Update the queue while maintaining position
        await TrackPlayer.reset();
        await TrackPlayer.add(shuffledQueue);
        await TrackPlayer.skip(currentTrack);
        await TrackPlayer.seekTo(currentPosition);
        if (wasPlaying) {
          await TrackPlayer.play();
        }
      } else if (shuffleActive) {
        // Restore original playlist order
        updateTrackIndexMap(playlist);
        await TrackPlayer.reset();
        await TrackPlayer.add(playlist);
        await TrackPlayer.skip(currentTrack);
        await TrackPlayer.seekTo(currentPosition);
        if (wasPlaying) {
          await TrackPlayer.play();
        }
      }
    } catch (error) {
      console.error("Error toggling shuffle:", error);
    }
  }, [playlist, shuffleActive, updateTrackIndexMap]);

  // Toggle loop mode
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
      remainingSeconds
    ).padStart(2, "0")}`;
  }, []);

  // Check if two songs are the same
  const isSameSong = useCallback((song1, song2) => {
    if (!song1 || !song2) return false;

    // Compare by ID if available
    if (song1.id && song2.id) {
      return song1.id === song2.id;
    }

    // Fallback to name and artist comparison
    const song1Name = song1.song || song1.title || song1.name;
    const song2Name = song2.song || song2.title || song2.name;
    const song1Artist = song1.primary_artists || song1.artist;
    const song2Artist = song2.primary_artists || song2.artist;

    return song1Name === song2Name && song1Artist === song2Artist;
  }, []);

  // Context value
  const contextValue = useMemo(
    () => ({
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      setIsPlaying,
      shuffleActive,
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
    }),
    [
      playlist,
      currentIndex,
      currentSong,
      isPlaying,
      shuffleActive,
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
    ]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
