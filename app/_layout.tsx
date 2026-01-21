import { PlayerProvider } from "@/context/playerContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View, AppState, Platform } from "react-native";
import { SettingsProvider } from "@/context/SettingsContext";
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  Event,
  State,
} from "react-native-track-player";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";

SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => require("@/context/service.js"));

export default function RootLayout() {
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        const isSetup = await TrackPlayer.isServiceRunning();
        if (!isSetup) {
          await TrackPlayer.setupPlayer();
          // Note: updateOptions is now handled in the service file
        }
      } catch (error) {
        console.error("Failed to setup player:", error);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    // Handle app state changes
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        // App is going to background, but don't stop playback
        // TrackPlayer will handle this automatically
      } else if (nextAppState === "active") {
      }
    };

    // Handle audio interruptions (calls, notifications, etc.)
    const setupAudioSession = async () => {
      try {
        if (Platform.OS === "ios") {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
            shouldDuckAndroid: true,
            interruptionModeAndroid:
              Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: true,
          });
        }
      } catch (error) {
        console.error("Failed to set audio mode:", error);
      }
    };

    // Handle TrackPlayer events
    const setupEventListeners = () => {
      // Handle remote duck (interruption)
      const duckListener = TrackPlayer.addEventListener(
        Event.RemoteDuck,
        async (event) => {
          if (event.ducking) {
            // Audio session was interrupted (phone call, etc.)
            const state = await TrackPlayer.getState();
            if (state === State.Playing) {
              await TrackPlayer.pause();
            }
          } else {
            // Interruption ended, but don't auto-resume
            // Let user decide when to resume
          }
        },
      );

      // Handle playback state changes
      const stateListener = TrackPlayer.addEventListener(
        Event.PlaybackState,
        async (event) => {
          // If playback stops, clear notifications
          if (event.state === State.Stopped) {
            await clearAllNotifications();
          }
        },
      );

      // Handle playback errors
      const errorListener = TrackPlayer.addEventListener(
        Event.PlaybackError,
        async (error) => {
          console.error("Playback error:", error);
          await TrackPlayer.stop();
          await clearAllNotifications();
        },
      );

      return () => {
        duckListener.remove();
        stateListener.remove();
        errorListener.remove();
      };
    };

    // Clear all music-related notifications
    const clearAllNotifications = async () => {
      try {
        await Notifications.dismissAllNotificationsAsync();
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch (error) {
        console.error("Error clearing notifications:", error);
      }
    };

    // Handle app termination
    const handleAppTermination = async () => {
      try {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        await clearAllNotifications();
      } catch (error) {
        console.error("Error during app termination cleanup:", error);
      }
    };

    // Setup everything
    const initialize = async () => {
      await setupPlayer();
      await setupAudioSession();

      // Setup event listeners
      const removeListeners = setupEventListeners();

      // Setup app state listener
      const appStateSubscription = AppState.addEventListener(
        "change",
        handleAppStateChange,
      );

      return () => {
        removeListeners();
        appStateSubscription?.remove();
      };
    };
  }, []);

  // Handle when component unmounts (app closes)
  useEffect(() => {
    return () => {
      // Final cleanup when app is completely removed from memory
      const finalCleanup = async () => {
        try {
          await TrackPlayer.stop();
          await TrackPlayer.reset();
          await Notifications.dismissAllNotificationsAsync();
          await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
          console.error("Final cleanup error:", error);
        }
      };

      finalCleanup();
    };
  }, []);

  return (
    <PlayerProvider>
      <SettingsProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </View>
      </SettingsProvider>
    </PlayerProvider>
  );
}
