import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeBtns from "../../components/homeBtns";
import Trending from "../../components/trending";
import useFetch from "@/services/useFetch";
import { fetchMusic, getNextPlaylist } from "../../services/api";

const Home = () => {
  const [active, setActive] = useState("Trending");
  const [greetings, setGreetings] = useState("Good Morning");

  // Use your existing hook
  const {
    data: music,
    loading,
    error,
    refetch,
    loadMore,
    allSongs,
    categoryIndices,
  } = useFetch(() => fetchMusic({ query: "", active }), [active]);

  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(false);

  useEffect(() => {
    const date = new Date();
    const hrs = date.getHours();
    if (hrs < 12) {
      setGreetings("Good Morning");
    } else if (hrs < 18) {
      setGreetings("Good Afternoon");
    } else {
      setGreetings("Good Evening");
    }
  }, []);

  const handleEndReached = async () => {
    if (loading || loadingMore || endReached) return;

    try {
      setLoadingMore(true);
      const result = await loadMore(active);

      if (result.success) {
        const nextPlaylistData = await getNextPlaylist(active);

        if (
          nextPlaylistData &&
          nextPlaylistData.songs &&
          nextPlaylistData.songs.length > 0
        ) {
          await refetch(true);
        } else {
          setEndReached(true);
        }
      } else {
        setEndReached(true);
      }
    } catch (err) {
      console.error("Error loading more songs:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <SafeAreaView className="bg-slate-50 h-full">
      <View className="w-full">
        <View className="w-full flex pt-10 pl-5 gap-1">
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.greetingName}>{greetings}</Text>
        </View>

        <View className="w-full flex flex-row items-center gap-2 pt-5 pl-5">
          <HomeBtns
            btnName="Trending"
            handlePress={() => {
              <ActivityIndicator size="large" color="#000" />;
              setActive("Trending");
              setEndReached(false);
            }}
            btnactive={active}
          />
          <HomeBtns
            btnName="Popular"
            handlePress={() => {
              setActive("Popular");
              setEndReached(false);
            }}
            btnactive={active}
          />
          <HomeBtns
            btnName="Recent"
            handlePress={() => {
              setActive("Recent");
              setEndReached(false);
            }}
            btnactive={active}
          />
        </View>

        <View className="pt-5 pl-5">
          <Text style={styles.activeText}>
            {active === "Recent" ? `${active} Release` : `${active} Songs`}
          </Text>
        </View>

        {loading || (!music?.songs?.length && !error) ? (
          <ActivityIndicator size="large" color="#000" />
        ) : error ? (
          <Text style={styles.errorText}>
            Something went wrong: {error.message}
          </Text>
        ) : (
          <FlatList
            data={music?.songs || []}
            renderItem={({ item, index }) => (
              <Trending
                type={active}
                song={item.song}
                image={item.image}
                music={item.music}
                duration={item.duration}
                primary_artists={item.primary_artists}
                song_url={item.media_url}
                index={index}
                allSongs={item || []}
              />
            )}
            windowSize={5}
            maxToRenderPerBatch={5}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footerLoadingContainer}>
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={styles.loadingText}>
                    Finding more songs...😃
                  </Text>
                </View>
              ) : endReached ? (
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>
                    You've caught them all! 🎶
                  </Text>
                </View>
              ) : null
            }
            keyExtractor={(item, index) => `${item.song}-${index}`}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  greetingText: {
    fontFamily: "Nunito-Regular",
    fontSize: 18,
  },
  greetingName: {
    fontFamily: "Nunito-Black",
    fontSize: 24,
  },
  activeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  footerContainer: {
    marginBottom: 250,
    marginTop: 25,
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  footerLoadingContainer: {
    marginTop: 20,
    marginBottom: 250,
    flex: 1,
    alignItems: "center",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  footerText: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },
});

export default Home;
