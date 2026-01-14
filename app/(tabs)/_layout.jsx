import { Image, Text, View, StyleSheet, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Tabs, useNavigation, usePathname, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import playSong from "@/assets/images/playIcon.png";
import pauseSong from "@/assets/images/pauseIcon.png";
import playnextSong from "@/assets/images/nextIcon.png";
import playpreviousSong from "@/assets/images/previousIcon.png";
import { usePlayer } from "@/context/playerContext";
import WelcomeComponent from "@/components/welcomeComponent";
import musicPlay from "@/assets/images/playing.gif";
import { StatusBar } from "expo-status-bar";
import Octicons from "@expo/vector-icons/Octicons";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import defaultMusicImage from "@/assets/images/musicImage.png";
import "@/global.css";
import he from "he";
const RootLayout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const navigation = useNavigation();

  const { currentSong, isPlaying, playNext, playPrevious, togglePlayPause } =
    usePlayer();

  const isPlayerScreen = pathname === "/player";
  const [loading, setLoading] = useState(true);

  const [fontsLoaded, error] = useFonts({
    "Nunito-Black": require("@/assets/fonts/Nunito-Black.ttf"),
    "Nunito-Regular": require("@/assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-Bold": require("@/assets/fonts/Nunito-ExtraBold.ttf"),
    "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("@/assets/fonts/Poppins-SemiBold.ttf"),
    "Audiowide-Regular": require("@/assets/fonts/Audiowide-Regular.ttf"),
    Octicons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Octicons.ttf"),
  });
  const cleanSongName = (name) => {
    if (!name) return "Unknown";

    const decodedName = he.decode(name);
    const songName = decodedName.replace(/_/g, " ").replace(/\s+/g, " ").trim();
    return songName;
  };

  useEffect(() => {
    if (error) throw error;
  }, [fontsLoaded, error]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getImageSource = (image) => {
    if (!image) return defaultMusicImage;

    if (typeof image === "string") {
      if (
        image.startsWith("http") ||
        image.startsWith("https") ||
        image.startsWith("content://") ||
        image.startsWith("file://")
      ) {
        return { uri: image };
      }
    }

    if (Array.isArray(image)) {
      if (image[2] && image[2].url) {
        return { uri: image[2].url };
      }
      for (let i = 0; i < image.length; i++) {
        if (image[i] && image[i].url) {
          return { uri: image[i].url };
        }
      }
    }

    return defaultMusicImage;
  };
  const navigatePlayer = () => {
    router.push("/player");
  };

  const handlePlayPause = () => {
    togglePlayPause();
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <WelcomeComponent />
      </View>
    );
  }

  return (
    <>
      {/* {loading ? (
        <WelcomeComponent />
      ) : (
      )} */}
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor="#000" style="light" />
        <Tabs
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#333",
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
              borderTopWidth: 1,
              paddingLeft: 45,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              width: "100%",
              height: 70,
              borderColor: "transparent",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: -2 },
              shadowRadius: 5,
            },
            tabBarButton: (props) => {
              return (
                <Pressable
                  {...props}
                  android_ripple={{ color: "transparent" }}
                  android_disableSound={false}
                  style={(state) => [
                    props.style,
                    {
                      backgroundColor: state.pressed
                        ? "transparent"
                        : "transparent",
                    },
                  ]}
                />
              );
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <MaterialCommunityIcons
                  name={focused ? "home-variant" : "home-variant-outline"}
                  size={27}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Search",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "search-sharp" : "search-outline"}
                  size={27}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="playlists"
            options={{
              title: "Playlists",
              tabBarIcon: ({ color, focused }) => (
                <Ionicons
                  name={focused ? "heart" : "heart-outline"}
                  size={27}
                  color={color}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="downloads"
            options={{
              title: "Downloads",
              tabBarIcon: ({ color, focused }) => (
                <Octicons name="download" size={27} color={color} />
              ),
            }}
          />
        </Tabs>

        {!isPlayerScreen && currentSong && (
          <View style={styles.miniPlayerContainer}>
            <Pressable
              onPress={navigatePlayer}
              style={styles.songInfo}
              hitSlop={10}
              android_ripple={{ color: "#444" }}
            >
              <Image
                source={getImageSource(currentSong.image)}
                style={styles.songImage}
              />
              {isPlaying && (
                <Image source={musicPlay} style={styles.gifAnimation} />
              )}

              <View style={styles.songTextContainer}>
                <Text numberOfLines={1} style={styles.songTitle}>
                  {cleanSongName(currentSong.song || currentSong.title) ||
                    "Unkown Name"}
                </Text>
                <Text numberOfLines={1} style={styles.songArtist}>
                  {currentSong.primary_artists ||
                    currentSong.music ||
                    currentSong.artists.primary.map((a) => a.name)}
                </Text>
              </View>
            </Pressable>

            <View style={styles.controlsContainer}>
              <Pressable onPress={playPrevious} hitSlop={10}>
                <Image source={playpreviousSong} style={styles.controlIcon} />
              </Pressable>
              <Pressable onPress={handlePlayPause} hitSlop={10}>
                <Image
                  source={isPlaying ? pauseSong : playSong}
                  style={styles.controlIcon}
                />
              </Pressable>
              <Pressable onPress={playNext} hitSlop={10}>
                <Image source={playnextSong} style={styles.controlIcon} />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </>
  );
};

export default RootLayout;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  miniPlayerContainer: {
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
  },
  songInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  songTextContainer: {
    flex: 1,
  },
  songTitle: {
    color: "white",
    fontSize: 15,
    fontFamily: "Nunito-Bold",
  },
  songArtist: {
    color: "white",
    fontSize: 12,
    fontFamily: "Nunito-Regular",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  gifAnimation: {
    position: "absolute",
    left: 5,
    width: 40,
    height: 40,
  },
});
