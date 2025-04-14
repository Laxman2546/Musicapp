import { PlayerProvider } from "@/context/playerContext";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function RootLayout() {
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
