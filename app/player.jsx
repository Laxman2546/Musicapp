import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
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
import he from "he";
import {
  MusicImageSkeleton,
  SongInfoSkeleton,
  FloatingParticles,
} from "../components/SkeletonLoader.jsx";
import TrackPlayer, {
  State,
  usePlaybackState,
} from "react-native-track-player";
import defaultMusicImage from "@/assets/images/musicImage.png";

const { width, height } = Dimensions.get("window");

const MusicPlayer = () => {
  const playbackState = usePlaybackState();
  const {
    currentSong,
    playNext,
    playPrevious,
    isPlaying,
    loading,
    setIsPlaying,
    currentIndex,
    playlist,
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
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const [musicLaoding, setmusicLaoding] = useState(true);

  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setmusicLaoding(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (shuffleActive || !shuffleActive) {
      setmusicLaoding(true);
    }
    const timer = setTimeout(() => {
      setmusicLaoding(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, [shuffleActive]);

  useEffect(() => {
    if (playbackState === State.Playing) {
      setLocalIsPlaying(true);
      setIsPlaying(true);
    } else if (
      playbackState === State.Paused ||
      playbackState === State.Stopped
    ) {
      setLocalIsPlaying(false);
      setIsPlaying(false);
    }
  }, [playbackState, setIsPlaying]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await AsyncStorage.getItem("favouriteSongs");
        const favoriteList = favorites ? JSON.parse(favorites) : [];
        const isFav = favoriteList.some(
          (favSong) =>
            favSong.song === currentSong?.song ||
            (currentSong.title &&
              favSong.primary_artists === currentSong?.primary_artists)
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
              favSong.song === currentSong?.song ||
              (currentSong.title &&
                favSong.primary_artists === currentSong?.primary_artists)
            )
        );
      } else {
        favouriteList.push({
          song: currentSong.song || currentSong.title,
          image: currentSong.image,
          duration: currentSong.duration,
          primary_artists:
            currentSong.primary_artists ||
            currentSong.artists.primary.map((a) => a.name),
          song_url:
            currentSong.media_url ||
            currentSong.filePath ||
            currentSong.song_url ||
            currentSong.downloadUrl[4]?.url ||
            currentSong.downloadUrl[3].url,
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

  const cleanSongName = (name) => {
    if (!name) return "Unknown";
    const decodedName = he.decode(name);
    return decodedName.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  };

  const handlePress = () => {
    router.back();
  };

  const handlePlayPause = async () => {
    await togglePlayPause();
  };

  const imageSource = (image) => {
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
      for (let i = 0; i < image.length; i++) {
        if (image[i] && image[i].url) {
          return { uri: image[i].url };
        }
      }
    }

    return defaultMusicImage;
  };

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noSongText}>Loading Your song...</Text>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  const handleLyrics = () => {
    console.log("lurics played");
  };

  return (
    <GestureRecognizer
      onSwipeLeft={playNext}
      onSwipeRight={playPrevious}
      config={{ velocityThreshold: 0.2, directionalOffsetThreshold: 40 }}
      style={{ flex: 1 }}
    >
      <View style={styles.mainBg}>
        <View style={styles.topContainer}>
          <View style={styles.header}>
            <Text style={styles.textFont}>Now Playing</Text>
            <Pressable onPress={handleLyrics} hitSlop={10}>
              <View style={styles.Lyrics}>
                <Text style={styles.textFontLyric}>Lyrics</Text>
              </View>
            </Pressable>
            <Pressable onPress={handlePress} hitSlop={10}>
              <Image source={backIcon} style={styles.backBtn} />
            </Pressable>
          </View>

          <Pressable onPress={handlePlayPause}>
            <View style={styles.imageContainer}>
              {musicLaoding ? (
                <>
                  <FloatingParticles count={4} />
                  <MusicImageSkeleton />
                </>
              ) : (
                <Image
                  source={imageSource(currentSong.image)}
                  style={styles.musicImg}
                />
              )}
            </View>
          </Pressable>
        </View>

        <View style={styles.musicBg}>
          <View style={styles.songRow}>
            <View style={styles.songInfoContainer}>
              {musicLaoding ? (
                <SongInfoSkeleton />
              ) : (
                <>
                  <Text style={styles.musicText} numberOfLines={1}>
                    {cleanSongName(currentSong.song || currentSong.title)}
                  </Text>
                  <Text style={styles.musicArtist} numberOfLines={1}>
                    {currentSong.primary_artists ||
                      currentSong.music ||
                      currentSong.artists.primary.map((a) => a.name)}
                  </Text>
                </>
              )}
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

          <Slider
            style={{ width: width * 0.9, height: 40 }}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position || 0}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#303030"
            thumbTintColor="#FFFFFF"
            onSlidingComplete={seekTo}
          />

          <View style={styles.timeRow}>
            <Text style={styles.textFont}>{formatTime(position)}</Text>
            <Text style={styles.textFont2}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controlsRow}>
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

            <View style={styles.middleControls}>
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
                <View style={styles.playPauseButton}>
                  <Image
                    source={localIsPlaying ? pauseIcon : playIcon}
                    style={styles.playPauseIcon}
                  />
                </View>
              </Pressable>

              <Pressable
                onPress={playNext}
                disabled={currentIndex >= playlist.length - 1 && !shuffleActive}
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
                style={[styles.controlIcon, loopMode > 0 && styles.activeIcon]}
              />
            </Pressable>
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
  mainBg: {
    flex: 1,
    backgroundColor: "#2A2A2A",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  topContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: height * 0.05,
  },
  textFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.038,
    color: "#fff",
  },
  textFontLyric: {
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.038,
    color: "#fff",
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 2,
    paddingTop: 3,
    borderColor: "#696969",
    borderWidth: 1,
    borderRadius: 10,
  },
  Lyrics: {
    position: "absolute",
    textAlign: "center",
    left: 80,
    top: -28,
  },
  textFont2: {
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.038,
    color: "#fff",
  },
  header: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    width: 20,
    height: 20,
    position: "absolute",
    top: -25,
    right: 140,
  },
  imageContainer: {
    marginVertical: height * 0.07,
  },
  musicImg: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    backgroundColor: "#d7d7d7",
  },
  musicBg: {
    backgroundColor: "#000",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: width * 0.05,
    paddingBottom: height * 0.05,
  },
  songRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.02,
    padding: 5,
  },
  songInfoContainer: {
    flex: 1,
    marginRight: 10,
  },
  musicText: {
    fontFamily: "Nunito-Black",
    fontSize: width * 0.06,
    color: "#fff",
  },
  musicArtist: {
    fontFamily: "Nunito-Regular",
    fontSize: width * 0.045,
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
  downloadSize: {
    width: 20,
    height: 20,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: height * 0.05,
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
  disabledButton: {
    opacity: 0.3,
  },
  middleControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: width * 0.09,
  },
  playPauseButton: {
    width: width * 0.19,
    height: width * 0.16,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#2C2C2C",
  },
  playPauseIcon: {
    width: 25,
    height: 25,
  },
  activeIcon: {
    tintColor: "#fff",
  },
});
