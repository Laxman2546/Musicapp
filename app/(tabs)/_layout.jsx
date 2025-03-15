import { Image, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SplashScreen, Tabs } from "expo-router";
import home from "@/assets/images/home.png";
import search from "@/assets/images/search.png";
import playlist from "@/assets/images/playlist.png";
import downloads from "@/assets/images/download.png";
import { useFonts } from "expo-font";
import "@/global.css";
const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Nunito-Black": require("@/assets/fonts/Nunito-Black.ttf"),
    "Nunito-Regular": require("@/assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Bold": require("@/assets/fonts/Nunito-ExtraBold.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // Ensure loading text is styled properly
  if (!fontsLoaded) {
    return (
      <Text
        style={{
          fontFamily: "Poppins-Regular",
          textAlign: "center",
          flex: 1,
          justifyContent: "center",
        }}
      >
        Loading...
      </Text>
    );
  }

  // Custom TabIcon component to handle tab bar icon rendering
  const TabIcon = ({ icon, color, focused }) => {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: 50,
        }}
      >
        <Image
          source={icon}
          resizeMode="contain"
          style={{
            tintColor: color,
            width: 25,
            height: 25,
          }}
        />
      </View>
    );
  };

  return (
    <>
      <Tabs
        initialRouteName="search"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: "#000",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: 60,
            paddingBottom: 5,
            borderColor: "transparent",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={home} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={search} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="playlists"
          options={{
            title: "Playlists",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={playlist} color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="downloads"
          options={{
            title: "Downloads",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon icon={downloads} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default RootLayout;
