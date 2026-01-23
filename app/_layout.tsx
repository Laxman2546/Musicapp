import { PlayerProvider } from "@/context/playerContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View, AppState, Platform } from "react-native";

import TrackPlayer from "react-native-track-player";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";

export default function RootLayout() {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();

        // DO NOT block splash on TrackPlayer
        setTimeout(async () => {
          try {
            const running = await TrackPlayer.isServiceRunning();

            if (!running) {
              await TrackPlayer.setupPlayer();
            }
          } catch (e) {
            console.log("TrackPlayer init skipped:", e);
          }
        }, 0);

        // Audio session
        if (Platform.OS === "ios") {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
          });
        }
      } catch (e) {
        console.log("Init error:", e);
      } finally {
        if (mounted) {
          await SplashScreen.hideAsync();
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PlayerProvider>
      <SettingsProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </SettingsProvider>
    </PlayerProvider>
  );
}
