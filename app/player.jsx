import {
  Image,
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import ProgressBar from "react-native-progress/Bar";
import prevBtn from "@/assets/images/previousIcon.png";
import playIcon from "@/assets/images/playIcon.png";
import pauseIcon from "@/assets/images/pauseIcon.png";
import nextIcon from "@/assets/images/nextIcon.png";
import downloadIcon from "@/assets/images/downloadIcon2.png";
import ShuffleIcon from "@/assets/images/shuffle.png";
import loopFirst from "@/assets/images/repeatFirst.png";
import loopSecond from "@/assets/images/repeatSecond.png";
import { usePlayer } from "@/context/playerContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const MusicPlayer = () => {
  const [shuffleActive, setShuffleActive] = useState(false);
  const [loopMode, setLoopMode] = useState(0);

  const {
    currentSong,
    playNext,
    playPrevious,
    isPlaying,
    setIsPlaying,
    currentIndex,
    playlist,
  } = usePlayer();

  if (!currentSong) {
    useEffect(() => {
      router.replace("/");
    }, []);

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noSongText}>No song selected</Text>
      </SafeAreaView>
    );
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLoopToggle = () => {
    setLoopMode((prevMode) => (prevMode + 1) % 3);
  };

  const formatTime = (seconds) => {
    if (!seconds) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };
  return (
    <View className="w-full h-full mt-5" style={styles.mainBg}>
      <View className="flex flex-col gap-12">
        <View className="flex flex-col gap-14">
          <View className="w-full flex items-center mt-8">
            <Text style={styles.textFont}>Now Playing</Text>
          </View>
          <View className="w-full flex items-center justify-center">
            <Image
              source={{ uri: currentSong.image }}
              defaultSource={require("@/assets/images/example.jpg")}
              style={styles.musicImg}
            />
          </View>
        </View>
        <View
          className="w-full flex flex-col bg-black h-full p-5  gap-3"
          style={styles.musicBg}
        >
          <View className="flex flex-row items-center justify-between">
            <View style={styles.songInfoContainer}>
              <Text
                style={styles.musicText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentSong.song}
              </Text>
              <Text
                style={styles.musicArtist}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentSong.primary_artists || currentSong.music}
              </Text>
            </View>
            <Pressable style={styles.downloadButton}>
              <Image source={downloadIcon} style={styles.downloadSize} />
            </Pressable>
          </View>

          <View className="w-full flex items-center flex-col gap-25">
            <ProgressBar
              progress={0.1}
              height={8}
              width={310}
              borderRadius={25}
              color={"#fff"}
              backgroundColor={"#3O3O3O"}
              borderColor={"#303030"}
              style={styles.progressBar}
            />
            <View className="flex flex-row justify-between w-full">
              <Text style={styles.textFont}>
                {formatTime(currentSong.duration * 0.2)}
              </Text>
              <Text style={styles.textFont}>
                {formatTime(currentSong.duration)}
              </Text>
            </View>
            <View
              className="flex flex-row items-center justify-between w-full"
              style={{
                marginTop: 25,
                alignItems: "center",
              }}
            >
              <Pressable onPress={() => setShuffleActive((prev) => !prev)}>
                <View
                  className="w-10 h-10 p-2 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: shuffleActive ? "#2C2C2C" : "",
                    borderRadius: shuffleActive ? 50 : "",
                  }}
                >
                  <Image source={ShuffleIcon} style={styles.downloadSize} />
                </View>
              </Pressable>
              <View className="flex flex-row items-center gap-9 align-middle justify-center ">
                <Pressable onPress={playPrevious} disabled={currentIndex <= 0}>
                  <Image
                    source={prevBtn}
                    style={[
                      styles.iconsSize,
                      currentIndex <= 0 && styles.disabledButton,
                    ]}
                  />
                </Pressable>
                <Pressable onPress={handlePlayPause}>
                  <View className="w-16 h-14 p-2 items-center justify-center rounded-xl bg-[#2C2C2C]">
                    <Image
                      source={isPlaying ? playIcon : pauseIcon}
                      style={styles.PlaySize}
                    />
                  </View>
                </Pressable>
                <Pressable
                  onPress={playNext}
                  disabled={currentIndex >= playlist.length - 1}
                >
                  <Image
                    source={nextIcon}
                    style={[
                      styles.iconsSize,
                      currentIndex >= playlist.length - 1 &&
                        styles.disabledButton,
                    ]}
                  />
                </Pressable>
              </View>
              <Pressable onPress={handleLoopToggle}>
                <View>
                  <Image
                    source={loopMode === 0 ? loopFirst : loopSecond}
                    style={[
                      styles.downloadSize,
                      loopMode > 0 && styles.activeButton,
                    ]}
                  />
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MusicPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
  },
  noSongText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  textFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  mainBg: {
    backgroundColor: "#2A2A2A",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  musicBg: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  musicImg: {
    width: 250,
    height: 250,
    borderRadius: 20,
  },

  songInfoContainer: {
    flex: 1,
    marginRight: 10,
    overflow: "hidden",
  },
  musicText: {
    fontFamily: "Nunito-Black",
    fontSize: 25,
    color: "#fff",
  },
  musicArtist: {
    fontFamily: "Nunito-Regular",
    fontSize: 18,
    color: "#fff",
  },

  downloadButton: {
    width: 44,
    height: 44,
    backgroundColor: "#2B2B2B",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    color: "#fff",
    marginTop: 15,
  },
  iconsSize: {
    width: 30,
    height: 30,
  },
  PlaySize: {
    width: 20,
    height: 20,
  },
  downloadSize: {
    width: 20,
    height: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  activeButton: {
    tintColor: "#fff",
  },
});
