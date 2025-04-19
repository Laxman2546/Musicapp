import { Image, Text, View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Tabs, useNavigation, usePathname, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import home from "@/assets/images/home.png";
import search from "@/assets/images/search.png";
import playlistIcon from "@/assets/images/playlist.png";
import downloads from "@/assets/images/user.png";
import playSong from "@/assets/images/playIcon.png";
import pauseSong from "@/assets/images/pauseIcon.png";
import playnextSong from "@/assets/images/nextIcon.png";
import playpreviousSong from "@/assets/images/previousIcon.png";
import { usePlayer } from "@/context/playerContext";
import WelcomeComponent from "@/components/welcomeComponent";
import musicPlay from "@/assets/images/playing.gif";
import "@/global.css";

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
  });

  useEffect(() => {
    if (error) throw error;
  }, [fontsLoaded, error]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const getImageSource = (image) => {
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("@/assets/images/musicImage.png");
  };

  const navigatePlayer = () => {
    router.push("/player");
  };

  const handlePlayPause = () => {
    togglePlayPause();
  };

  const TabIcon = ({ icon, color }) => (
    <View style={{ alignItems: "center", justifyContent: "center", width: 50 }}>
      <Image
        source={icon}
        resizeMode="contain"
        style={{ tintColor: color, width: 25, height: 25 }}
      />
    </View>
  );

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <WelcomeComponent />
      </View>
    );
  }

  return (
    <>
      {loading ? (
        <WelcomeComponent />
      ) : (
        <View style={{ flex: 1 }}>
          <Tabs
            initialRouteName="index"
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false,
              tabBarActiveTintColor: "#000",
              tabBarHideOnKeyboard: true,
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
                  <TabIcon icon={home} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="search"
              options={{
                title: "Search",
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon icon={search} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="playlists"
              options={{
                title: "Playlists",
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon icon={playlistIcon} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="downloads"
              options={{
                title: "Downloads",
                tabBarIcon: ({ color, focused }) => (
                  <TabIcon icon={downloads} color={color} />
                ),
              }}
            />
          </Tabs>

          {!isPlayerScreen && currentSong && (
            <View style={styles.miniPlayerContainer}>
              <TouchableOpacity
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
                    {currentSong.song}
                  </Text>
                  <Text numberOfLines={1} style={styles.songArtist}>
                    {currentSong.primary_artists || currentSong.music}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={playPrevious} hitSlop={10}>
                  <Image source={playpreviousSong} style={styles.controlIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePlayPause} hitSlop={10}>
                  <Image
                    source={isPlaying ? pauseSong : playSong}
                    style={styles.controlIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={playNext} hitSlop={10}>
                  <Image source={playnextSong} style={styles.controlIcon} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
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
