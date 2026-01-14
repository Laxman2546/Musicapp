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
import More from "@/assets/images/more.png";
import { EllipsisVerticalIcon } from "lucide-react-native";
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
  const [rawLyrics, setRawLyrics] = useState("");
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState(false);
  const [lyricsData, setlyricsData] = useState([]);
  const [showLyricsData, setShowLyricsData] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const flatListRef = useRef();
  const lyricsRef = useRef();
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
            syncedIndex * ITEM_HEIGHT - CENTER_OFFSET + ITEM_HEIGHT * 0.01
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
          `https://lrclib.net/api/search?track_name=${encodeURIComponent(name)}`
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
        })
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
    <GestureRecognizer
      onSwipeLeft={playNext}
      onSwipeRight={playPrevious}
      config={{ velocityThreshold: 0.2, directionalOffsetThreshold: 40 }}
      style={{ flex: 1 }}
    >
      <View style={styles.mainBg}>
        <View style={styles.topContainer}>
          <View style={styles.header}>
            <Text style={styles.textFont}>
              {isRadioStream ? "Live Radio" : "Now Playing"}
            </Text>
            {!isRadioStream &&
              (!showLyrics ? (
                <Pressable
                  onPress={() =>
                    handleLyrics(
                      cleanSongName(currentSong.song || currentSong.title)
                    )
                  }
                  hitSlop={10}
                >
                  <Animated.View
                    style={[
                      styles.Lyrics,
                      showLyrics && styles.activeLyricsButton,
                      {
                        transform: [{ scale: showLyrics ? 1.05 : 1 }],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.textFontLyric,
                        showLyrics && styles.activeLyricsText,
                      ]}
                    >
                      {lyricsLoading ? "Fetching.." : "Lyrics"}
                    </Text>
                  </Animated.View>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleMore();
                    }}
                    hitSlop={10}
                  >
                    <View style={styles.moreSize}>
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
                        <View>
                          <Text style={styles.moreText}>Select Lyrics</Text>
                        </View>
                      </Pressable>

                      <View
                        style={{
                          width: 100,
                          borderWidth: 1,
                          borderColor: "#ccc",
                        }}
                      />

                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setShowLyrics(false);
                          setShowLyricsData(false);
                          setShowMore(false);
                        }}
                        hitSlop={10}
                      >
                        <View>
                          <Text style={styles.moreText}>Close Lyrics</Text>
                        </View>
                      </Pressable>
                    </View>
                  )}
                </>
              ))}

            <Pressable onPress={handlePress} hitSlop={10}>
              <Image source={backIcon} style={styles.backBtn} />
            </Pressable>
          </View>

          <Pressable onPress={handlePlayPause}>
            <View style={styles.imageContainer}>
              {!showLyricsData ? (
                <>
                  {!showLyrics ? (
                    <>
                      {musicLaoding ? (
                        <>
                          <MusicImageSkeleton />
                        </>
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
                          <>
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
                          </>
                        </View>
                      )}
                    />
                  )}
                </>
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
                  <View className="flex flex-row gap-2 items-center">
                    <Text style={styles.musicArtist} numberOfLines={1}>
                      {currentSong.primary_artists ||
                        currentSong.music ||
                        currentSong.artists?.primary
                          ?.map((a) => a.name)
                          .join(", ") ||
                        "Unknown Artist"}
                    </Text>
                    {isRadioStream && (
                      <View style={styles.liveIndicator}></View>
                    )}
                  </View>
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
    paddingRight: 10,
    paddingBottom: 2,
    paddingTop: 3,
    borderColor: "#696969",
    borderWidth: 1,
    borderRadius: 10,
  },
  lyricsData: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    overflowY: "Scroll",
    gap: 8,
  },
  noLyrics: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
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

  lyricsDataText: {
    minWidth: "90%",
    color: "#fff",
    padding: 5,
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    borderWidth: 1,
    borderColor: "#696969",
    borderRadius: 10,
    marginTop: 20,
  },
  lyricsDataTitle: {
    color: "#fff",
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
  activeLyricsButton: {
    backgroundColor: "#696969",
    shadowColor: "#fff",
    color: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  activeLyricsText: {
    color: "#fff",
  },
  Lyrics: {
    position: "absolute",
    textAlign: "center",
    left: 70,
    top: -27,
    borderRadius: 10,
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
    backgroundColor: "#d7d7d7",
    objectFit: "cover",
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
    color: "#ccc",
    textAlign: "center",
    fontFamily: "Nunito-Regular",
    lineHeight: width * 0.05,
  },
  activeLyricText: {
    color: "#fff",
    fontFamily: "Nunito-Bold",
    fontSize: width * 0.05,
    textShadowColor: "rgba(74, 144, 226, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
    padding: 12,
  },
  nearLyricText: {
    color: "#e0e0e0",
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
    color: "#ccc",
    fontFamily: "Poppins-SemiBold",
    fontSize: width * 0.044,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  errorSubText: {
    color: "#aaa",
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.038,
    textAlign: "center",
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
  moreBg: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    position: "absolute",
    right: 45,
    top: 20,
    display: "flex",
    flexDirection: "flex-col",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    zIndex: 50,
  },
  moreText: {
    fontFamily: "Poppins-Regular",
    color: "#000",
    fontSize: 15,
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
  moreSize: {
    position: "absolute",
    left: 130,
    top: -25,
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
  radioInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    gap: 10,
  },
  radioLiveText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Nunito-Bold",
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff0000",
    marginTop: 5,
    animationName: "pulse",
    animationDuration: "2s",
    animationIterationCount: "infinite",
  },
});
