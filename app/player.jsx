import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from "react-native";
import { useEffect, useState, useRef } from "react";
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
import GestureRecognizer, {
  swipeDirections,
} from "react-native-swipe-gestures";
const MusicPlayer = () => {
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

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noSongText}>No song selected</Text>
      </SafeAreaView>
    );
  }
  const onSwipeperLeftformed = () => {
    console.log("swiped");
    playNext();
  };
  const onSwipeperRightformed = () => {
    console.log("swiped");
    playPrevious();
  };
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };
  return (
    <GestureRecognizer
      onSwipeLeft={onSwipeperLeftformed}
      onSwipeRight={onSwipeperRightformed}
      config={config}
      style={{ flex: 1 }}
    >
      <View className="w-full h-full mt-5" style={styles.mainBg}>
        <View className="flex flex-col gap-12">
          <View className="flex flex-col gap-14">
            <View className="w-full flex items-center mt-8">
              <Text style={styles.textFont}>Now Playing</Text>
            </View>
            <Pressable onPress={() => setIsPlaying(!isPlaying)}>
              <View className="w-full flex items-center justify-center">
                <Image
                  source={{ uri: currentSong.image }}
                  defaultSource={require("@/assets/images/example.jpg")}
                  style={styles.musicImg}
                />
              </View>
            </Pressable>
          </View>
          <View
            className="w-full flex flex-col bg-black h-full p-5 gap-3"
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
                progress={progress || 0}
                height={8}
                width={310}
                borderRadius={25}
                color={"#fff"}
                backgroundColor={"#303030"}
                borderColor={"#303030"}
                style={styles.progressBar}
                onTouchStart={(e) => {
                  const touchX = e.nativeEvent.locationX;
                  const width = 310;
                  const newProgress = Math.max(0, Math.min(touchX / width, 1));
                  seekTo(newProgress);
                }}
              />
              <View className="flex flex-row justify-between w-full">
                <Text style={styles.textFont}>{formatTime(position)}</Text>
                <Text style={styles.textFont}>{formatTime(duration)}</Text>
              </View>
              <View
                className="flex flex-row items-center justify-between w-full"
                style={{
                  marginTop: 25,
                  alignItems: "center",
                }}
              >
                <Pressable onPress={toggleShuffle}>
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
                  <Pressable
                    onPress={playPrevious}
                    disabled={currentIndex <= 0 && !shuffleActive}
                  >
                    <Image
                      source={prevBtn}
                      style={[
                        styles.iconsSize,
                        currentIndex <= 0 &&
                          !shuffleActive &&
                          styles.disabledButton,
                      ]}
                    />
                  </Pressable>
                  <Pressable onPress={() => setIsPlaying(!isPlaying)}>
                    <View className="w-16 h-14 p-2 items-center justify-center rounded-xl bg-[#2C2C2C]">
                      <Image
                        source={isPlaying ? pauseIcon : playIcon}
                        style={styles.PlaySize}
                      />
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={playNext}
                    disabled={
                      currentIndex >= playlist.length - 1 && !shuffleActive
                    }
                  >
                    <Image
                      source={nextIcon}
                      style={[
                        styles.iconsSize,
                        currentIndex >= playlist.length - 1 &&
                          !shuffleActive &&
                          styles.disabledButton,
                      ]}
                    />
                  </Pressable>
                </View>
                <Pressable onPress={toggleLoopMode}>
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
    </GestureRecognizer>
  );
};

export default MusicPlayer;

// Keep your existing styles

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
