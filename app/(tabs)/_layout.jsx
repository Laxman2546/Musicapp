import { Image, Text, View, StyleSheet, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import {
  SplashScreen,
  Stack,
  Tabs,
  useNavigation,
  usePathname,
  useRouter,
} from "expo-router";
import { KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import home from "@/assets/images/home.png";
import search from "@/assets/images/search.png";
import playlistIcon from "@/assets/images/playlist.png";
import downloads from "@/assets/images/download.png";
import playSong from "@/assets/images/playIcon.png";
import pauseSong from "@/assets/images/pauseIcon.png";
import playnextSong from "@/assets/images/nextIcon.png";
import playpreviousSong from "@/assets/images/previousIcon.png";
import { useFonts } from "expo-font";
import "@/global.css";
import { usePlayer } from "@/context/playerContext";
const RootLayout = () => {
  const router = useRouter();
  const {
    currentSong,
    playNext,
    playPrevious,
    isPlaying,
    setIsPlaying,
    currentIndex,
    playlist,
    progress,
    position,
    duration,
    shuffleActive,
    loopMode,
    toggleShuffle,
    toggleLoopMode,
    seekTo,
    formatTime,
  } = usePlayer();
  const navigation = useNavigation();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const pathname = usePathname();
  const isPlayerScreen = pathname === "/player";
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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const getImageSource = (image) => {
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: currentSong.image };
    }
    return require("@/assets/images/musicImage.png");
  };
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
  const navigatePlayer = () => {
    router.push("/player");
  };
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <Tabs
          initialRouteName="index"
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
              display: keyboardVisible || isPlayerScreen ? "none" : "flex",
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
                <TabIcon icon={playlistIcon} color={color} focused={focused} />
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
        {!isPlayerScreen && currentSong && (
          <View
            style={{
              position: "absolute",
              bottom: 70,
              left: 10,
              right: 10,
              backgroundColor: "#222",
              padding: 15,
              borderRadius: 15,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 5,
            }}
          >
            <View>
              <Pressable
                onPress={navigatePlayer}
                className="flex flex-row w-full items-center gap-3 relative"
              >
                <View>
                  <Image
                    source={getImageSource(currentSong.image)}
                    defaultSource={require("@/assets/images/example.jpg")}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                    }}
                  />
                </View>
                <View>
                  <Text
                    className="text-white"
                    numberOfLines={1}
                    style={{
                      paddingRight: 200,
                      fontSize: 15,
                      fontFamily: "Nunito-Bold",
                    }}
                  >
                    {currentSong.song}
                  </Text>
                  <Text
                    className="text-white"
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      paddingRight: 200,
                      fontFamily: "Nunito-Regular",
                    }}
                  >
                    {currentSong.primary_artists || currentSong.music}
                  </Text>
                </View>
              </Pressable>
              <View
                className="flex flex-row gap-2 items-center"
                style={{
                  position: "absolute",
                  right: 50,
                  top: 15,
                }}
              >
                <Pressable onPress={playPrevious}>
                  <Image
                    source={playpreviousSong}
                    className="w-[15px] h-[15px]"
                    style={{
                      width: 20,
                      height: 20,
                    }}
                  />
                </Pressable>
                <Pressable onPress={() => setIsPlaying(!isPlaying)}>
                  <Image
                    source={isPlaying ? pauseSong : playSong}
                    className="w-[15px] h-[15px]"
                    style={{
                      width: 20,
                      height: 20,
                    }}
                  />
                </Pressable>
                <Pressable onPress={playNext}>
                  <Image
                    source={playnextSong}
                    className="w-[15px] h-[15px]"
                    style={{
                      width: 20,
                      height: 20,
                    }}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default RootLayout;
