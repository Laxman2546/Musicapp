import { PlayerProvider } from "@/context/playerContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
} from "react-native-track-player";

// First, register the playback service
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
      }
    };

    setupPlayer();
  }, []);

  return (
    <PlayerProvider>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="player"
            options={{
              headerShown: false,
              presentation: "card",
              gestureEnabled: true,
              gestureDirection: "vertical",
              animationDuration: 400,
            }}
          />
          <Stack.Screen
            name="localFiles"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="downloadsFolder"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="likedSongs"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="premlist"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </PlayerProvider>
  );
}
