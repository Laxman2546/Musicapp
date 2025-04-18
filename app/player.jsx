import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { usePlayer } from "@/context/playerContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import GestureRecognizer from "react-native-swipe-gestures";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import prevBtn from "@/assets/images/previousIcon.png";
import playIcon from "@/assets/images/playIcon.png";
import pauseIcon from "@/assets/images/pauseIcon.png";
import nextIcon from "@/assets/images/nextIcon.png";
import ShuffleIcon from "@/assets/images/shuffle.png";
import loopFirst from "@/assets/images/repeatFirst.png";
import loopSecond from "@/assets/images/repeatSecond.png";
import backIcon from "@/assets/images/backImg.png";
import heart from "@/assets/images/heart.png";
import heartFill from "@/assets/images/heartfill.png";
import TrackPlayer, { State } from "react-native-track-player";
import defaultMusicImage from "@/assets/images/musicImage.png";

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
    togglePlayPause,
  } = usePlayer();

  const [favouriteClick, setfavouriteClick] = useState(false);

  useEffect(() => {
    const syncPlaybackState = async () => {
      try {
        const state = await TrackPlayer.getState();
        setIsPlaying(state === State.Playing);
      } catch (err) {
        console.log("Error getting playback state:", err);
      }
    };

    syncPlaybackState();
  }, [setIsPlaying]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await AsyncStorage.getItem("favouriteSongs");
        const favoriteList = favorites ? JSON.parse(favorites) : [];
        const isFav = favoriteList.some(
          (favSong) =>
            favSong.song === currentSong?.song &&
            favSong.primary_artists === currentSong?.primary_artists
        );
        setfavouriteClick(isFav);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    if (currentSong) checkFavoriteStatus();
  }, [currentSong]);

  const favouriteSongs = async () => {
    if (!currentSong) return;
    try {
      const favourites = await AsyncStorage.getItem("favouriteSongs");
      let favouriteList = favourites ? JSON.parse(favourites) : [];

      if (favouriteClick) {
        favouriteList = favouriteList.filter(
          (favSong) =>
            !(
              favSong.song === currentSong?.song &&
              favSong.primary_artists === currentSong?.primary_artists
            )
        );
      } else {
        favouriteList.push({
          song: currentSong.song,
          image: currentSong.image,
          duration: currentSong.duration,
          primary_artists: currentSong.primary_artists,
          song_url:
            currentSong.media_url ||
            currentSong.filePath ||
            currentSong.song_url,
        });
      }

      await AsyncStorage.setItem(
        "favouriteSongs",
        JSON.stringify(favouriteList)
      );
      setfavouriteClick(!favouriteClick);
    } catch (e) {
      console.log("Error saving favourite song:", e);
    }
  };

  const handlePress = () => {
    router.back();
  };

  const handlePlayPause = () => {
    togglePlayPause();
  };

  const getImageSource = (image) => {
    if (!image) return defaultMusicImage;
    if (typeof image === "string") {
      if (image.startsWith("http")) {
        return { uri: image };
      } else if (
        image.startsWith("content://") ||
        image.startsWith("file://")
      ) {
        return { uri: image };
      }
    }
    return defaultMusicImage;
  };

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noSongText}>No song selected</Text>
      </SafeAreaView>
    );
  }
  return (
    <GestureRecognizer
      onSwipeLeft={playNext}
      onSwipeRight={playPrevious}
      config={{ velocityThreshold: 0.2, directionalOffsetThreshold: 40 }}
      style={{ flex: 1 }}
    >
      <View className="w-full h-full mt-5" style={styles.mainBg}>
        <View className="flex flex-col gap-12">
          <View className="flex flex-col gap-14">
            <View className="w-full relative">
              <View className="w-full flex items-center mt-8">
                <Text style={styles.textFont}>Now Playing</Text>
              </View>
              <Pressable onPress={handlePress} hitSlop={10}>
                <Image source={backIcon} style={styles.backBtn} />
              </Pressable>
            </View>

            <Pressable onPress={handlePlayPause}>
              <View className="w-full flex items-center justify-center">
                <Image
                  source={getImageSource(currentSong.image)}
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
                <Text style={styles.musicText} numberOfLines={1}>
                  {currentSong.song}
                </Text>
                <Text style={styles.musicArtist} numberOfLines={1}>
                  {currentSong.primary_artists || currentSong.music}
                </Text>
              </View>
              <Pressable
                onPress={favouriteSongs}
                hitSlop={10}
                style={styles.downloadButton}
              >
                <Image
                  source={favouriteClick ? heartFill : heart}
                  style={styles.downloadSize}
                />
              </Pressable>
            </View>

            <View className="w-full flex items-center flex-col gap-2">
              <Slider
                style={{ width: 310, height: 40 }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#303030"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={seekTo}
              />

              <View className="flex flex-row justify-between w-full">
                <Text style={styles.textFont}>{formatTime(position)}</Text>
                <Text style={styles.textFont}>{formatTime(duration)}</Text>
              </View>

              <View className="flex flex-row items-center justify-between w-full mt-4">
                <Pressable
                  onPress={toggleShuffle}
                  hitSlop={10}
                  style={[
                    styles.controlButton,
                    shuffleActive && styles.activeControlButton,
                  ]}
                >
                  <Image source={ShuffleIcon} style={styles.controlIcon} />
                </Pressable>

                <View className="flex flex-row items-center gap-9">
                  <Pressable
                    onPress={playPrevious}
                    disabled={currentIndex <= 0 && !shuffleActive}
                    hitSlop={10}
                  >
                    <Image
                      source={prevBtn}
                      style={[
                        styles.controlIcon,
                        currentIndex <= 0 &&
                          !shuffleActive &&
                          styles.disabledButton,
                      ]}
                    />
                  </Pressable>

                  <Pressable onPress={handlePlayPause}>
                    <View className="w-16 h-14 p-2 items-center justify-center rounded-xl bg-[#2C2C2C]">
                      <Image
                        source={isPlaying ? pauseIcon : playIcon}
                        style={styles.playPauseIcon}
                      />
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={playNext}
                    disabled={
                      currentIndex >= playlist.length - 1 && !shuffleActive
                    }
                    hitSlop={10}
                  >
                    <Image
                      source={nextIcon}
                      style={[
                        styles.controlIcon,
                        currentIndex >= playlist.length - 1 &&
                          !shuffleActive &&
                          styles.disabledButton,
                      ]}
                    />
                  </Pressable>
                </View>

                <Pressable
                  onPress={toggleLoopMode}
                  hitSlop={10}
                  style={[
                    styles.controlButton,
                    loopMode > 0 && styles.activeControlButton,
                  ]}
                >
                  <Image
                    source={loopMode === 0 ? loopFirst : loopSecond}
                    style={[
                      styles.controlIcon,
                      loopMode > 0 && styles.activeIcon,
                    ]}
                  />
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
  backBtn: {
    width: 20,
    height: 20,
    position: "absolute",
    top: -25,
    left: 15,
  },
  controlButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
  },
  activeControlButton: {
    backgroundColor: "#2C2C2C",
  },
  controlIcon: {
    width: 20,
    height: 20,
  },
  playPauseIcon: {
    width: 20,
    height: 20,
  },
  activeIcon: {
    tintColor: "#fff",
  },
});
