import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import React, { useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMusic } from "@/services/api";
import backIcon from "@/assets/images/previous.png";
import Trending from "@/components/trending";

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const Premlist = () => {
  const { premaUrl, listname, designImage } = useLocalSearchParams();
  const { data, loading, error, refetch } = useFetch(
    () => fetchMusic({ premaUrl }),
    [premaUrl],
  );

  const scrollY = useRef(new Animated.Value(0)).current;

  const imageSource = (image) => {
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
  };

  const handleBack = () => {
    router.back();
  };

 
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.4],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: "clamp",
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [20, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          <Image
            source={imageSource(designImage)}
            resizeMode="cover"
            style={styles.designImage}
          />
          <View style={styles.overlay} />
        </Animated.View>

        <Pressable onPress={handleBack} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Image source={backIcon} style={styles.backIcon} />
          </View>
        </Pressable>

        <Animated.View
          style={[
            styles.collapsedTitle,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.collapsedTitleText} numberOfLines={1}>
            {listname || "Nanimusic"}
          </Text>
        </Animated.View>
      </Animated.View>

      {loading || (!data && !error) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😥</Text>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <Pressable onPress={refetch} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.FlatList
          data={Array.isArray(data?.songs) ? data.songs : []}
          contentContainerStyle={styles.listContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          windowSize={5}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.playlistTitle}>
                {listname || "Nanimusic"}
              </Text>
              <Text style={styles.songCount}>
                {data?.songs?.length || 0} songs
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Trending
              song={item.song}
              image={item.image}
              music={item.music}
              duration={item.duration}
              primary_artists={item.primary_artists}
              song_url={item.media_url}
              index={index}
              allSongs={data?.songs || []}
            />
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text style={styles.footerText}>You've reached the end ✨</Text>
            </View>
          }
          keyExtractor={(item, index) => `${item.song}-${index}`}
        />
      )}
    </View>
  );
};

export default Premlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  designImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 20,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  collapsedTitle: {
    position: "absolute",
    bottom: 20,
    left: 70,
    right: 20,
  },
  collapsedTitleText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 150,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 150,
  },
  errorEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: "#000",
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retryButtonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  listContent: {
    paddingTop: HEADER_MAX_HEIGHT + 20,
    paddingBottom: 100,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  playlistTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 28,
    color: "#000",
    marginBottom: 4,
  },
  songCount: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#666",
  },
  footer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#999",
  },
});
