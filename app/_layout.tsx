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

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// First, register the playback service
TrackPlayer.registerPlaybackService(() => require("@/context/service.js"));
const linking = {
  prefixes: ["myapp://"],
  config: {
    screens: {
      "(tabs)": "",
      player: "player",
      localFiles: "localFiles",
      downloadsFolder: "downloadsFolder",
      likedSongs: "likedSongs",
      premlist: "premlist",
      "[...unmatched]": "*",
    },
  },
};

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
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
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
          <Stack.Screen name="localFiles" options={{ headerShown: false }} />
          <Stack.Screen
            name="downloadsFolder"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="likedSongs" options={{ headerShown: false }} />
          <Stack.Screen name="premlist" options={{ headerShown: false }} />
          <Stack.Screen
            name="[...unmatched]"
            options={{
              title: "Not Found",
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </PlayerProvider>
  );
}
