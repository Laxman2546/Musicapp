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

  // Sync playback state with `isPlaying`
  useEffect(() => {
    const updatePlaybackState = async () => {
      if (playbackState === State.Playing) {
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };
    updatePlaybackState();
  }, [playbackState]);

  // Handle TrackPlayer events
  useTrackPlayerEvents(
    [
      Event.PlaybackTrackChanged,
      Event.PlaybackQueueEnded,
      Event.PlaybackState,
      Event.RemotePlay,
      Event.RemotePause,
    ],
    async (event) => {
      if (event.type === Event.PlaybackState) {
        setIsPlaying(event.state === State.Playing);
      } else if (
        event.type === Event.PlaybackTrackChanged &&
        event.nextTrack !== null
      ) {
        setCurrentIndex(event.nextTrack);
        const track = await TrackPlayer.getTrack(event.nextTrack);
        setCurrentSong(track);
      } else if (event.type === Event.PlaybackQueueEnded) {
        if (loopMode === RepeatMode.Queue) {
          await TrackPlayer.seekTo(0);
          await TrackPlayer.play();
        } else {
          setIsPlaying(false);
        }
      } else if (event.type === Event.RemotePlay) {
        setIsPlaying(true);
      } else if (event.type === Event.RemotePause) {
        setIsPlaying(false);
      }
    }
  );

  useEffect(() => {
    if (progress) {
      setPosition(progress.position);
      setDuration(progress.duration);
    }
  }, [progress]);

  const playSong = useCallback(
    async (song, allSongs, index) => {
      try {
        const tracks = allSongs
          .map((song) => ({
            ...song,
            url: song.song_url || song.media_url || song.filePath || "",
            title: song.song || "Unknown Title",
            artist: song.primary_artists || song.music || "Unknown Artist",
            artwork: song.image || null,
          }))
          .filter((track) => track.url);

        if (currentSong && song.song === currentSong.song) {
          // If the same song is selected, navigate to player
          router.push("/player");
          return;
        }

        if (tracks.length === 0) {
          console.error("No valid tracks to play");
          return;
        }

        // Set current song first to ensure correct image shows immediately
        setCurrentSong(tracks[index]);
        setPlaylist(tracks);
        setCurrentIndex(index);

        // Then handle track player updates
        await TrackPlayer.reset();
        await TrackPlayer.add(tracks);
        await TrackPlayer.skip(index);
        await TrackPlayer.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing song:", error);
      }
    },
    [currentSong]
  );

  // Play next song
  const playNext = useCallback(async () => {
    try {
      if (shuffleActive && playlist.length > 1) {
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
        const queue = await TrackPlayer.getQueue();
        if (currentIndex < queue.length - 1) {
          await TrackPlayer.skipToNext();
          const nextTrack = await TrackPlayer.getCurrentTrack();
          setCurrentIndex(nextTrack);
          const track = await TrackPlayer.getTrack(nextTrack);
          setCurrentSong(track);
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
      await TrackPlayer.skipToPrevious();
      const prevTrack = await TrackPlayer.getCurrentTrack();
      setCurrentIndex(prevTrack);
      setCurrentSong(await TrackPlayer.getTrack(prevTrack));
      setIsPlaying(true);
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

  useTrackPlayerEvents(
    [Event.PlaybackState, Event.PlaybackTrackChanged],
    async (event) => {
      if (event.type === Event.PlaybackState) {
        const state = await TrackPlayer.getState();
        setIsPlaying(state === State.Playing);
      } else if (
        event.type === Event.PlaybackTrackChanged &&
        event.nextTrack !== null
      ) {
        setCurrentIndex(event.nextTrack);
        const track = await TrackPlayer.getTrack(event.nextTrack);
        setCurrentSong(track);
        const state = await TrackPlayer.getState();
        setIsPlaying(state === State.Playing);
      }
    }
  );

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
  }, [playlist, shuffleActive]);

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
    ]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
