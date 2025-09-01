import { PlayerProvider } from "@/context/playerContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import * as Linking from "expo-linking";
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
} from "react-native-track-player";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => require("@/context/service.js"));

export default function RootLayout() {
  useEffect(() => {
    const setupPlayer = async () => {
      try {
        const isSetup = await TrackPlayer.isServiceRunning();
        if (!isSetup) {
          await TrackPlayer.setupPlayer();
          await TrackPlayer.updateOptions({
            android: {
              appKilledPlaybackBehavior:
                AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
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
            progressUpdateEventInterval: 2,
          });
        }
      } catch (error) {
        console.error("Failed to setup player:", error);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    setupPlayer();
  }, []);

  return (
    <PlayerProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </View>
    </PlayerProvider>
  );
}
