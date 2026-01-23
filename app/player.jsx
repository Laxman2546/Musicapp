import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/context/playerContext";
import { SafeAreaView } from "react-native-safe-area-context";
import useSyncedLyrics from "../hooks/useSyncedLyrics.jsx";
import { router } from "expo-router";
import GestureRecognizer from "react-native-swipe-gestures";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import TextTicker from "react-native-text-ticker";
import { LinearGradient } from "expo-linear-gradient";
import { getColorsForImage } from "@/services/Colors";
import {
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import he from "he";
import { MusicImageSkeleton } from "../components/SkeletonLoader.jsx";
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
    showSongLyrics,
    togglePlayPause,
  } = usePlayer();

  const [favouriteClick, setfavouriteClick] = useState(false);
  const [localIsPlaying, setLocalIsPlaying] = useState(isPlaying);
  const [musicLaoding, setmusicLaoding] = useState(true);
  const [rawLyrics, setRawLyrics] = useState("");
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState(false);
  const [lyricsData, setlyricsData] = useState([]);
  const [showLyricsData, setShowLyricsData] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const flatListRef = useRef();
  const lyricsRef = useRef();
  const [colors, setColors] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const lyricsOpacity = useRef(new Animated.Value(0)).current;
  const scrollAnimation = useRef(null);
  const {
    lyrics,
    currentIndex: syncedIndex,
    hasLyrics,
  } = useSyncedLyrics(rawLyrics);

  useEffect(() => {
    setLocalIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (currentSong) {
      setShowLyrics(false);
      setRawLyrics("");
      setLyricsError(false);
      setShowLyricsData(false);
      setShowMore(false);
    }
  }, [currentSong?.song, currentSong?.title]);

  useEffect(() => {
    if (currentIndex >= 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: true,
        viewPosition: 0.8,
      });
    }
  }, [currentIndex]);
  useEffect(() => {
    if (showLyrics) {
      Animated.timing(lyricsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(lyricsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showLyrics]);
  useEffect(() => {
    if (
      showLyrics &&
      lyricsRef.current &&
      lyrics.length > 0 &&
      syncedIndex >= 0
    ) {
      if (scrollAnimation.current) {
        scrollAnimation.current.stop();
      }

      const scrollToLyric = () => {
        try {
          const ITEM_HEIGHT = 50;
          const CONTAINER_HEIGHT = width * 0.5;
          const CENTER_OFFSET = CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2;

          const targetOffset = Math.max(
            0,
            syncedIndex * ITEM_HEIGHT - CENTER_OFFSET + ITEM_HEIGHT * 0.01,
          );

          lyricsRef.current?.scrollToOffset({
            offset: targetOffset,
            animated: true,
          });
        } catch (error) {
          console.log("Scroll error:", error);
        }
      };
      const timeoutId = setTimeout(scrollToLyric, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [syncedIndex, showLyrics, lyrics.length]);

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

  const isRadioStream = currentSong?.isRadio || false;

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favorites = await AsyncStorage.getItem("favouriteSongs");
        const favoriteList = favorites ? JSON.parse(favorites) : [];
        const isFav = favoriteList.some(
          (favSong) =>
            favSong.song === currentSong?.song ||
            (currentSong.title &&
              favSong.primary_artists === currentSong?.primary_artists),
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
            ),
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
        JSON.stringify(favouriteList),
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
  const handleMore = () => {
    setShowMore(!showMore);
  };
  const showMoreLyrics = () => {
    setShowLyricsData(!showLyricsData);
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
  useEffect(() => {
    const fetchColors = async () => {
      if (!currentSong?.image) {
        setColors(null);
        return;
      }
      const resImageSource = imageSource(currentSong?.image);
      const result = await getColorsForImage(resImageSource);
      setColors(result);
    };

    fetchColors();
  }, [currentSong?.image]);
  const handelenewLyrics = (lyrics) => {
    setRawLyrics(lyrics);
    setShowLyricsData(false);
    setShowLyrics(true);
  };
  const handleLyrics = async (name) => {
    setShowLyrics(!showLyrics);

    if (!showLyrics && !rawLyrics) {
      setLyricsLoading(true);
      setLyricsError(false);

      try {
        const response = await fetch(
          `https://lrclib.net/api/search?track_name=${encodeURIComponent(name)}`,
        );
        const data = await response.json();

        if (data && data.length > 0 && data[0].syncedLyrics) {
          setRawLyrics(data[0].syncedLyrics);
          setlyricsData(data);
          setLyricsError(false);
        } else {
          setLyricsError(true);
        }
      } catch (error) {
        console.error("Error fetching lyrics:", error);
        setLyricsError(true);
      } finally {
        setLyricsLoading(false);
      }
    }
  };

  const renderLyricItem = ({ item, index }) => {
    const isActive = index === syncedIndex;
    const isNear = Math.abs(index - syncedIndex) <= 2;

    return (
      <Animated.View
        style={[
          styles.lyricContainer,
          {
            opacity: isActive ? 1 : isNear ? 0.7 : 0.4,
            transform: [
              {
                scale: isActive ? 1.05 : 1,
              },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.lyricText,
            isActive && styles.activeLyricText,
            isNear && !isActive && styles.nearLyricText,
          ]}
        >
          {item.text}
        </Text>
      </Animated.View>
    );
  };

  const getItemLayout = (data, index) => ({
    length: 5,
    offset: 5 * index,
    index,
  });

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noSongText}>Loading Your song...</Text>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRadioStream && localIsPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 15000, // one full rotation in 6 seconds
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ).start();
    } else {
      rotateAnim.stopAnimation(); // stop rotation when not streaming
      rotateAnim.setValue(0); // reset
    }
  }, [isRadioStream, localIsPlaying]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView SafeAreaView style={{ flex: 1 }}>
      <GestureRecognizer
        onSwipeLeft={playNext}
        onSwipeRight={playPrevious}
        config={{ velocityThreshold: 0.2, directionalOffsetThreshold: 40 }}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={[colors?.darkVibrant || "#1a1a2e", "#0f0f1e"]}
          style={{ flex: 1 }}
        >
          <View style={styles.mainBg}>
            <View style={styles.topContainer}>
              <View style={styles.headerContainer}>
                <Pressable
                  onPress={handlePress}
                  hitSlop={10}
                  style={styles.backButton}
                >
                  <ChevronLeftIcon size={34} color={"#fff"} />
                </Pressable>
                <Text
                  style={styles.headerTitle}
                  className="ml-[50px] text-nowrap"
                >
                  {isRadioStream ? "Live Radio" : "Now Playing"}
                </Text>
                <View style={styles.headerButtonsContainer}>
                  {!isRadioStream &&
                    !showSongLyrics &&
                    (!showLyrics ? (
                      <Pressable
                        onPress={() =>
                          handleLyrics(
                            cleanSongName(
                              currentSong.song || currentSong.title,
                            ),
                          )
                        }
                        hitSlop={10}
                      >
                        <Animated.View
                          style={[
                            styles.lyricsButton,
                            showLyrics && styles.activeLyricsButton,
                            {
                              transform: [{ scale: showLyrics ? 1.05 : 1 }],
                            },
                          ]}
                        >
                          <Text style={styles.lyricsButtonText}>
                            {lyricsLoading ? "Fetching.." : "Lyrics"}
                          </Text>
                        </Animated.View>
                      </Pressable>
                    ) : (
                      <View style={styles.moreButtonContainer}>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleMore();
                          }}
                          hitSlop={10}
                        >
                          <View style={styles.moreButton}>
                            <EllipsisVerticalIcon color="#fff" />
                          </View>
                        </Pressable>

                        {showMore && (
                          <View style={styles.moreBg}>
                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                setShowMore(false);
                                showMoreLyrics();
                              }}
                            >
                              <Text style={styles.moreText}>Select Lyrics</Text>
                            </Pressable>

                            <View style={styles.divider} />

                            <Pressable
                              onPress={(e) => {
                                e.stopPropagation();
                                setShowLyrics(false);
                                setShowLyricsData(false);
                                setShowMore(false);
                              }}
                              hitSlop={10}
                            >
                              <Text style={styles.moreText}>Close Lyrics</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    ))}
                </View>
              </View>

              <Pressable onPress={handlePlayPause}>
                <View style={styles.imageContainer}>
                  {!showLyricsData ? (
                    <>
                      {!showLyrics ? (
                        <>
                          {musicLaoding ? (
                            <MusicImageSkeleton />
                          ) : (
                            <Animated.View style={{ opacity: fadeAnim }}>
                              <Animated.Image
                                source={imageSource(currentSong.image)}
                                style={[
                                  styles.musicImg,
                                  {
                                    borderRadius: isRadioStream ? 200 : 20,
                                    borderWidth: isRadioStream ? 3 : 0,
                                    borderColor: isRadioStream
                                      ? "#fff"
                                      : "transparent",
                                    transform: isRadioStream
                                      ? [{ rotate: spin }]
                                      : [],
                                  },
                                ]}
                              />
                            </Animated.View>
                          )}

                          {!musicLaoding && (
                            <View style={styles.songInfoBelowImage}>
                              <TextTicker
                                duration={20000}
                                bounce
                                repeatSpacer={40}
                                marqueeDelay={3000}
                                numberOfLines={1}
                                style={styles.songTitle}
                              >
                                {cleanSongName(
                                  currentSong.song || currentSong.title,
                                )}
                              </TextTicker>
                              <View style={styles.artistRow}>
                                <TextTicker
                                  duration={10000}
                                  bounce
                                  repeatSpacer={10}
                                  marqueeDelay={3000}
                                  style={styles.artistName}
                                  numberOfLines={1}
                                >
                                  {currentSong.primary_artists ||
                                    currentSong.music ||
                                    currentSong.artists?.primary
                                      ?.map((a) => a.name)
                                      .join(", ") ||
                                    "Unknown Artist"}
                                </TextTicker>
                                {isRadioStream && (
                                  <View style={styles.liveIndicator}></View>
                                )}
                              </View>
                            </View>
                          )}
                        </>
                      ) : (
                        <Animated.View
                          style={[
                            styles.lyricsContainer,
                            { opacity: lyricsOpacity },
                          ]}
                        >
                          {lyricsLoading ? (
                            <View style={styles.loadingContainer}>
                              <ActivityIndicator size="large" color="#fff" />
                              <Text style={styles.loadingText}>
                                Fetching lyrics...
                              </Text>
                            </View>
                          ) : lyricsError || !hasLyrics ? (
                            <View style={styles.errorContainer}>
                              <Text style={styles.errorText}>
                                No synchronized lyrics available
                              </Text>
                              <Text style={styles.errorSubText}>
                                Enjoy the Song! 🎵
                              </Text>
                              <Pressable onPress={() => showMoreLyrics()}>
                                <View style={styles.checkMore}>
                                  <Text style={styles.checkText}>
                                    Check more Lyrics
                                  </Text>
                                </View>
                              </Pressable>
                            </View>
                          ) : (
                            <FlatList
                              ref={lyricsRef}
                              data={lyrics}
                              keyExtractor={(item, index) =>
                                `${item.time}-${index}`
                              }
                              renderItem={renderLyricItem}
                              getItemLayout={getItemLayout}
                              initialNumToRender={15}
                              maxToRenderPerBatch={10}
                              windowSize={21}
                              showsVerticalScrollIndicator={false}
                              contentContainerStyle={styles.lyricsListContainer}
                              decelerationRate="fast"
                              scrollEventThrottle={16}
                              onScrollToIndexFailed={(error) => {
                                setTimeout(() => {
                                  try {
                                    const offset =
                                      error.averageItemLength * error.index;
                                    lyricsRef.current?.scrollToOffset({
                                      offset,
                                      animated: true,
                                    });
                                  } catch (e) {
                                    console.log("Fallback scroll failed:", e);
                                  }
                                }, 100);
                              }}
                            />
                          )}
                        </Animated.View>
                      )}
                    </>
                  ) : (
                    <>
                      {lyricsData.length === 0 ? (
                        <View style={styles.errorContainer}>
                          <Text style={styles.errorText}>No lyrics Found</Text>
                          <Text style={styles.errorSubText}>
                            Enjoy the Song! 🎵
                          </Text>
                        </View>
                      ) : (
                        <FlatList
                          data={lyricsData}
                          keyExtractor={(item, index) => index.toString()}
                          initialNumToRender={15}
                          maxToRenderPerBatch={10}
                          windowSize={21}
                          showsVerticalScrollIndicator={false}
                          contentContainerStyle={styles.lyricsListContainer}
                          decelerationRate="fast"
                          scrollEventThrottle={16}
                          renderItem={({ item, index }) => (
                            <View style={styles.lyricsData}>
                              {item.syncedLyrics && (
                                <Pressable
                                  onPress={() =>
                                    handelenewLyrics(item.syncedLyrics)
                                  }
                                  hitSlop={10}
                                >
                                  <View style={styles.lyricsDataText}>
                                    <Text style={styles.lyricsDataAlbum}>
                                      {item?.albumName || "Unknown Album"}
                                    </Text>
                                    <Text style={styles.lyricsDataTitle}>
                                      {item?.name || "Unknown Song"}
                                    </Text>
                                  </View>
                                </Pressable>
                              )}
                            </View>
                          )}
                        />
                      )}
                    </>
                  )}
                </View>
              </Pressable>
            </View>

            <View style={styles.controlsSection}>
              <Slider
                style={{ width: width * 0.9, height: 40 }}
                minimumValue={0}
                maximumValue={duration || 1}
                value={position || 0}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255, 255, 255, 0.2)"
                thumbTintColor="#FFFFFF"
                onSlidingComplete={seekTo}
              />

              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
                  <Shuffle size={24} color={"#fff"} />
                </Pressable>

                <View style={styles.middleControls}>
                  <Pressable
                    onPress={playPrevious}
                    disabled={currentIndex <= 0 && !shuffleActive}
                    hitSlop={10}
                  >
                    <SkipBack
                      size={24}
                      color={"#fff"}
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
                      {localIsPlaying ? (
                        <Ionicons name="pause" size={44} color="white" />
                      ) : (
                        <Ionicons name="play" size={44} color="white" />
                      )}
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={playNext}
                    disabled={
                      currentIndex >= playlist.length - 1 && !shuffleActive
                    }
                    hitSlop={10}
                  >
                    <SkipForward
                      size={24}
                      color={"#fff"}
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
                  onPress={favouriteSongs}
                  hitSlop={10}
                  style={styles.favoriteButton}
                >
                  {favouriteClick ? (
                    <FontAwesome name="heart" size={24} color="red" />
                  ) : (
                    <FontAwesome name="heart-o" size={24} color="white" />
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </LinearGradient>
      </GestureRecognizer>
    </SafeAreaView>
  );
};

export default MusicPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  noSongText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  mainBg: {
    flex: 1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  topContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: height * 0.02,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
    width: "100%",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.04,

    color: "white",
    letterSpacing: 1,
    flex: 1,
    textAlign: "center",
  },
  headerButtonsContainer: {
    width: 100,
    alignItems: "flex-end",
  },
  lyricsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  activeLyricsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  lyricsButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.035,
    color: "#fff",
  },
  moreButtonContainer: {
    position: "relative",
    width: 50,
    alignItems: "flex-end",
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  moreBg: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 12,
    position: "absolute",
    top: 50,
    right: 0,
    minWidth: 150,
    gap: 8,
    zIndex: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  moreText: {
    fontFamily: "Poppins-Regular",
    color: "#000",
    fontSize: 15,
  },
  divider: {
    width: 100,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  imageContainer: {
    marginVertical: height * 0.03,
    alignItems: "center",
  },
  musicImg: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    objectFit: "cover",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  songInfoBelowImage: {
    marginTop: 24,
    alignItems: "center",
    width: width * 0.8,
  },
  songTitle: {
    fontFamily: "Nunito-Black",
    fontSize: width * 0.065,
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  artistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  artistName: {
    fontFamily: "Nunito-Regular",
    fontSize: width * 0.04,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  lyricsContainer: {
    width: width * 0.9,
    height: width * 0.8,
    borderRadius: 20,
    paddingVertical: 20,
  },
  lyricsListContainer: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  lyricContainer: {
    paddingVertical: 4,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  lyricText: {
    fontSize: width * 0.04,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
    fontFamily: "Nunito-Regular",
    lineHeight: width * 0.05,
  },
  activeLyricText: {
    color: "#fff",
    fontFamily: "Nunito-Bold",
    fontSize: width * 0.05,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    padding: 12,
  },
  nearLyricText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: width * 0.042,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.04,
    marginTop: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.044,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  errorSubText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.038,
    textAlign: "center",
  },
  checkMore: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 10,
  },
  checkText: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  lyricsData: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  lyricsDataText: {
    minWidth: "90%",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  lyricsDataTitle: {
    color: "rgba(255, 255, 255, 0.7)",
    padding: 5,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  lyricsDataAlbum: {
    color: "#fff",
    padding: 5,
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
  },
  controlsSection: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: width * 0.05,
    paddingBottom: height * 0.06,
    alignItems: "center",
  },
  favoriteButton: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  favoriteIcon: {
    width: 24,
    height: 24,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.9,
    marginTop: 10,
  },
  timeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.035,
    color: "rgba(255, 255, 255, 0.6)",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: height * 0.08,
    width: width * 0.9,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activeControlButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  controlIcon: {
    width: 22,
    height: 22,
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
    width: width * 0.2,
    height: width * 0.2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  playPauseIcon: {
    width: 28,
    height: 28,
  },
  activeIcon: {
    tintColor: "#fff",
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff0000",
  },
});
