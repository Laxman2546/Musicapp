import TrackPlayer, {
  Event,
  Capability,
  State,
} from "react-native-track-player";

import { router } from "expo-router";
import * as Linking from "expo-linking";

module.exports = async function () {
  // Configure TrackPlayer
  await TrackPlayer.updateOptions({
    stopWithApp: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
      Capability.SeekTo,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    android: {
      // Enable high-quality artwork in notifications
      alwaysPauseOnInterruption: true,
      foregroundServiceSettings: {
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        notificationIcon: "ic_launcher",
      },
    },
  });

  // Standard playback controls
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.reset();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });

  // NEW: Handle notification click to open player screen
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (!event.paused && !event.permanent) {
      // Interruption just ended or a notification was clicked
      try {
        // Deep link to open the player screen
        Linking.openURL("myapp://player");
      } catch (err) {
        console.log("Error opening URL:", err);
      }
    }
  });

  // Optional fallback — if notification supports click event
  TrackPlayer.addEventListener("remote-notification-click", () => {
    Linking.openURL("myapp://player");
  });

  // NEW: Handle audio focus for interruptions like phone calls
  let wasPlayingBeforeInterruption = false;

  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.paused) {
      // Audio was interrupted (e.g., phone call)
      const playerState = await TrackPlayer.getState();
      wasPlayingBeforeInterruption = playerState === State.Playing;
      if (wasPlayingBeforeInterruption) {
        await TrackPlayer.pause();
      }
    } else {
      // Interruption ended
      if (wasPlayingBeforeInterruption) {
        await TrackPlayer.play();
        wasPlayingBeforeInterruption = false;
      }

      // This could also be a notification click
      try {
        // Navigate to player screen
        router.push("/player");
      } catch (error) {
        // Handle error silently
      }
    }
  });

  return Promise.resolve();
};
