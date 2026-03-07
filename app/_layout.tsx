import { PlayerProvider } from "@/context/playerContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { View, Platform } from "react-native";

import TrackPlayer from "react-native-track-player";
import * as SplashScreen from "expo-splash-screen";
import { Audio } from "expo-av";

TrackPlayer.registerPlaybackService(() => require("@/context/service.js"));

export default function RootLayout() {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();

        // Audio session
        if (Platform.OS === "ios") {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
            playThroughEarpieceAndroid: false,
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
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="player"
              options={{
                animation: "slide_from_bottom",
                gestureEnabled: true,
                fullScreenGestureEnabled: true,
              }}
            />
          </Stack>
        </View>
      </SettingsProvider>
    </PlayerProvider>
  );
}
