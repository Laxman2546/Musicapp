import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  FlatList,
  Animated,
  Easing,
} from "react-native";
import { useEffect, useRef, useCallback } from "react";

const { width, height } = Dimensions.get("window");

const ITEM_HEIGHT = 75;
const CONTAINER_HEIGHT = height * 0.55;

export const AppleLyricsView = ({
  lyrics = [],
  syncedIndex = 0,
  lyricsLoading = false,
  lyricsError = false,
  hasLyrics = false,
  lyricsData = [],
  showLyricsData = false,
  onSelectLyrics,
}) => {
  const lyricsRef = useRef(null);
  const opacityAnims = useRef([]);
  const scaleAnims = useRef([]);

  if (opacityAnims.current.length < lyrics.length) {
    for (let i = opacityAnims.current.length; i < lyrics.length; i++) {
      opacityAnims.current.push(new Animated.Value(i === 0 ? 1 : 0.12));
      scaleAnims.current.push(new Animated.Value(i === 0 ? 1 : 0.88));
    }
  }

  useEffect(() => {
    if (syncedIndex < 0 || syncedIndex >= lyrics.length) return;

    lyrics.forEach((_, i) => {
      const isActive = i === syncedIndex;
      const dist = Math.abs(i - syncedIndex);

      const targetOpacity = isActive
        ? 1
        : dist === 1
          ? 0.45
          : dist === 2
            ? 0.28
            : 0.12;
      const targetScale = isActive ? 1 : dist <= 1 ? 0.93 : 0.88;

      if (!opacityAnims.current[i]) return;

      Animated.parallel([
        Animated.timing(opacityAnims.current[i], {
          toValue: targetOpacity,
          duration: isActive ? 300 : 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims.current[i], {
          toValue: targetScale,
          tension: 70,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [syncedIndex, lyrics.length]);

  useEffect(() => {
    if (!lyricsRef.current || syncedIndex < 0 || lyrics.length === 0) return;

    const CENTER_OFFSET = CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2;
    const targetOffset = Math.max(
      0,
      syncedIndex * ITEM_HEIGHT - CENTER_OFFSET + 250,
    );

    setTimeout(() => {
      try {
        lyricsRef.current?.scrollToOffset({
          offset: targetOffset,
          animated: true,
        });
      } catch (_) {}
    }, 60);
  }, [syncedIndex, lyrics.length]);

  const renderLyricItem = useCallback(
    ({ item, index }) => {
      const isActive = index === syncedIndex;
      const opacity = opacityAnims.current[index] ?? new Animated.Value(0.12);
      const scale = scaleAnims.current[index] ?? new Animated.Value(0.88);

      return (
        <Animated.View
          style={[styles.lyricRow, { opacity, transform: [{ scale }] }]}
        >
          <Text style={[styles.lyricLine, isActive && styles.lyricLineActive]}>
            {item.text}
          </Text>
        </Animated.View>
      );
    },
    [syncedIndex],
  );

  const getItemLayout = useCallback(
    (_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),
    [],
  );

  if (lyricsLoading) {
    return (
      <View style={styles.centerBox}>
        <PulsingDots />
        <Text style={styles.loadingLabel}>Finding lyrics…</Text>
      </View>
    );
  }

  if (lyricsError || (!hasLyrics && !lyricsLoading)) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.noLyricsEmoji}>🎵</Text>
        <Text style={styles.noLyricsTitle}>No Lyrics Available</Text>
        <Text style={styles.noLyricsSub}>Sit back and enjoy the music</Text>
        {lyricsData.length > 0 && (
          <Pressable onPress={() => onSelectLyrics?.()}>
            <View style={styles.tryOtherBtn}>
              <Text style={styles.tryOtherText}>Try Other Versions</Text>
            </View>
          </Pressable>
        )}
      </View>
    );
  }

  if (showLyricsData) {
    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerTitle}>Choose Lyrics Version</Text>
        <FlatList
          data={lyricsData.filter((d) => d.syncedLyrics)}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => onSelectLyrics?.(item.syncedLyrics)}>
              {({ pressed }) => (
                <View style={[styles.pickerCard, pressed && { opacity: 0.7 }]}>
                  <Text style={styles.pickerAlbum}>
                    {item.albumName || "Unknown Album"}
                  </Text>
                  <Text style={styles.pickerSong}>
                    {item.name || "Unknown Song"}
                  </Text>
                  <View style={styles.pickerBadge}>
                    <Text style={styles.pickerBadgeText}>Synced</Text>
                  </View>
                </View>
              )}
            </Pressable>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.lyricsWrapper}>
      <FlatList
        ref={lyricsRef}
        data={lyrics}
        keyExtractor={(item, index) => `${item.time}-${index}`}
        renderItem={renderLyricItem}
        getItemLayout={getItemLayout}
        initialNumToRender={20}
        maxToRenderPerBatch={15}
        windowSize={25}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lyricsList}
        scrollEnabled={false}
        onScrollToIndexFailed={(error) => {
          setTimeout(() => {
            try {
              lyricsRef.current?.scrollToOffset({
                offset: error.averageItemLength * error.index,
                animated: true,
              });
            } catch (_) {}
          }, 100);
        }}
      />
    </View>
  );
};

const PulsingDots = () => {
  const anims = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(anim, {
            toValue: 1,
            duration: 480,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 480,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  lyricsWrapper: {
    width: width * 0.9,
    height: CONTAINER_HEIGHT,
    overflow: "hidden",
    // NO backgroundColor — fully transparent so gradient bg shows through
  },
  lyricsList: {
    // Pad top+bottom so first/last line scrolls to vertical center
    paddingTop: CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    paddingBottom: CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2,
    paddingHorizontal: 4,
  },
  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CONTAINER_HEIGHT * 0.3,
    zIndex: 10,
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CONTAINER_HEIGHT * 0.3,
    zIndex: 10,
  },
  lyricRow: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  lyricLine: {
    fontSize: width * 0.055,
    color: "#ffffff",
    fontFamily: "Nunito-Bold",
    lineHeight: width * 0.072,
    letterSpacing: -0.2,
    textAlign: "left",
  },
  lyricLineActive: {
    fontSize: width * 0.062,
    fontFamily: "Nunito-Black",
    letterSpacing: -0.4,
    textShadowColor: "rgba(255,255,255,0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  centerBox: {
    width: width * 0.9,
    height: CONTAINER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  dotsRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" },
  loadingLabel: {
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    letterSpacing: 0.4,
  },
  noLyricsEmoji: { fontSize: 38, marginBottom: 4 },
  noLyricsTitle: {
    color: "#fff",
    fontFamily: "Nunito-Black",
    fontSize: width * 0.05,
  },
  noLyricsSub: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Nunito-Regular",
    fontSize: width * 0.037,
    textAlign: "center",
    maxWidth: "70%",
  },
  tryOtherBtn: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  tryOtherText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 14 },
  pickerContainer: { width: width * 0.9, height: CONTAINER_HEIGHT },
  pickerTitle: {
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Poppins-SemiBold",
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  pickerCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  pickerAlbum: {
    color: "#fff",
    fontFamily: "Nunito-Black",
    fontSize: 15,
    marginBottom: 2,
  },
  pickerSong: {
    color: "rgba(255,255,255,0.5)",
    fontFamily: "Nunito-Regular",
    fontSize: 13,
  },
  pickerBadge: {
    position: "absolute",
    top: 14,
    right: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pickerBadgeText: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Poppins-SemiBold",
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
