import { Image, Text, View } from "react-native";
import React, { useEffect } from "react";
import { SplashScreen, Tabs } from "expo-router";
import home from "@/assets/images/home.png";
import search from "@/assets/images/search.png";
import playlist from "@/assets/images/playlist.png";
import downloads from "@/assets/images/download.png";
import { useFonts } from "expo-font";
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

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }
  const TabIcon = ({ icon, color, name, focused }) => {
    return (
      <View className="flex items-center justify-center w-16 ">
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          className="mt-5 outline-none"
          style={{
            width: 25,
            height: 25,
          }}
        />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#000",
        tabBarStyle: {
          backgroundColor: "#fff",
          outline: "none",
          borderBlockColor: "transparent",
          outlineColor: "#fff",
          paddingBottom: 5,
          borderTopWidth: 1,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          height: 60,
          boxShadow: "none",
          borderColor: "transparent",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={home} color={color} name="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={search}
              color={color}
              name="Search"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: "Playlists",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={playlist}
              color={color}
              name="Playlists"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: "Downloads",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={downloads}
              color={color}
              name="Downloads"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default RootLayout;
