import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeBtns from "../../components/homeBtns";
import BhakthiBtns from "@/components/bhakthiBtns";
import Trending from "../../components/trending";
import useFetch from "@/services/useFetch";
import { fetchMusic, getNextPlaylist } from "../../services/api";
import ChartsComponent from "@/components/chartsComponent";
const Home = () => {
  const [active, setActive] = useState("All");
  const [bhakthiActive, setbhakthiActive] = useState("VenkateshwaraSwamy");
  const [greetings, setGreetings] = useState("Good Morning");

  const {
    data: music,
    loading,
    error,
    refetch,
    loadMore,
    allSongs,
    categoryIndices,
  } = useFetch(
    () => fetchMusic({ query: "", active, bhakthiActive }),
    [active, bhakthiActive]
  );

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
      const result = await loadMore(
        active === "Bhakthi" ? bhakthiActive : active
      );

      if (result.success) {
        const nextPlaylistData = await getNextPlaylist(active, bhakthiActive);

        if (nextPlaylistData?.songs?.length > 0) {
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
  const bhakthiOptions = [
    { name: "VenkateshwaraSwamy" },
    { name: "Shiva" },
    { name: "Durga Devi" },
    { name: "Ganesha" },
    { name: "Sai Baba" },
    { name: "Hanuman" },
  ];
  return (
    <SafeAreaView className="bg-slate-50 h-full">
      <View className="w-full">
        <View className="w-full flex pt-10 pl-5 gap-1">
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.greetingName}>{greetings}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          <View className="w-full flex flex-row items-center gap-2 pt-5 pl-5 overflow-auto md:overflow-scroll ">
            <HomeBtns
              btnName="All"
              handlePress={() => {
                setActive("All");
                setEndReached(false);
              }}
              btnactive={active}
            />
            <HomeBtns
              btnName="Trending"
              handlePress={() => {
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
            <HomeBtns
              btnName="Bhakthi"
              handlePress={() => {
                setActive("Bhakthi");
                setEndReached(false);
              }}
              btnactive={active}
            />
          </View>
        </ScrollView>

        {active === "All" ? (
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <>
              <View className="pt-5 pl-5">
                {loading || (!music?.telugu?.charts?.length && !error) ? (
                  <ActivityIndicator
                    size="large"
                    color="#000"
                    style={styles.loader}
                  />
                ) : error ? (
                  <Text style={styles.errorText}>
                    Something went wrong: {error.message}
                  </Text>
                ) : (
                  <>
                    <View style={styles.section}>
                      <View>
                        <Text style={styles.activeText}>
                          Top charts -Telugu
                        </Text>
                      </View>
                      <FlatList
                        data={music?.telugu?.charts || []}
                        contentContainerStyle={styles.flatListContent}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                          <>
                            <ChartsComponent
                              listname={item.listname}
                              premaUrl={item.perma_url}
                              image={item.image}
                              index={index}
                            />
                          </>
                        )}
                      />
                    </View>
                    <View style={styles.section}>
                      <View>
                        <Text style={styles.activeText}>
                          Featured Playlists
                        </Text>
                      </View>
                      <View>
                        <FlatList
                          data={music.telugu.featured_playlists || []}
                          contentContainerStyle={styles.flatListContent}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(item, index) => index.toString()}
                          windowSize={5}
                          maxToRenderPerBatch={5}
                          updateCellsBatchingPeriod={50}
                          removeClippedSubviews={true}
                          renderItem={({ item, index }) => (
                            <>
                              <ChartsComponent
                                listname={item.listname}
                                premaUrl={item.perma_url}
                                image={item.image}
                                index={index}
                                type={"featured"}
                              />
                            </>
                          )}
                        />
                      </View>
                    </View>
                    <View style={styles.section}>
                      <View>
                        <Text style={styles.activeText}>Top charts -Hindi</Text>
                      </View>
                      <View>
                        <FlatList
                          data={music?.general?.charts || []}
                          contentContainerStyle={styles.flatListContent}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(item, index) => index.toString()}
                          windowSize={5}
                          maxToRenderPerBatch={5}
                          updateCellsBatchingPeriod={50}
                          removeClippedSubviews={true}
                          renderItem={({ item, index }) => (
                            <>
                              <ChartsComponent
                                listname={item.title}
                                premaUrl={item.perma_url}
                                image={item.image}
                                index={index}
                                type={"featured"}
                              />
                            </>
                          )}
                        />
                      </View>
                    </View>
                    <View style={styles.section2}>
                      <View>
                        <Text style={styles.activeText}>
                          Top playlists -Hindi
                        </Text>
                      </View>
                      <View>
                        <FlatList
                          data={music?.general?.top_playlists || []}
                          contentContainerStyle={styles.flatListContent}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(item, index) => index.toString()}
                          windowSize={5}
                          maxToRenderPerBatch={5}
                          updateCellsBatchingPeriod={50}
                          removeClippedSubviews={true}
                          renderItem={({ item, index }) => (
                            <>
                              <ChartsComponent
                                listname={item.listname}
                                premaUrl={item.perma_url}
                                image={item.image}
                                index={index}
                                type={"featured"}
                              />
                            </>
                          )}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>
            </>
          </ScrollView>
        ) : (
          <>
            <View className="pt-5 pl-5">
              <Text style={styles.activeText}>
                {active === "Recent" ? `${active} Release` : `${active} Songs`}
              </Text>
            </View>
            {active === "Bhakthi" ? (
              <>
                <View className="w-full">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        marginLeft: 15,
                        gap: 10,
                      }}
                    >
                      {bhakthiOptions.map((option, index) => (
                        <BhakthiBtns
                          key={index}
                          btnName={option.name}
                          handlePress={() => {
                            setbhakthiActive(option.name);
                            setEndReached(false);
                          }}
                          btnactive={bhakthiActive}
                        />
                      ))}
                    </View>
                  </ScrollView>
                  <>
                    {loading || (!music?.songs?.length && !error) ? (
                      <ActivityIndicator size="large" color="#000" />
                    ) : error ? (
                      <Text style={styles.errorText}>
                        Something went wrong: {error.message}
                      </Text>
                    ) : (
                      <View className="mb-[600px]">
                        <Text className="text-center">
                          Bhakthi songs are still in Development...😐
                        </Text>
                        {/* <FlatList
                          data={music?.songs || []}
                          windowSize={5}
                          showsVerticalScrollIndicator={false}
                          maxToRenderPerBatch={5}
                          updateCellsBatchingPeriod={50}
                          removeClippedSubviews={true}
                          renderItem={({ item, index }) => (
                            <>
                              <Trending
                                type={active}
                                song={item.song}
                                image={item.image}
                                music={item.music}
                                duration={item.duration}
                                primary_artists={item.primary_artists}
                                song_url={item.media_url}
                                index={index}
                                allSongs={music?.songs || []}
                              />
                            </>
                          )}
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
                          keyExtractor={(item, index) =>
                            `${item.song}-${index}`
                          }
                        /> */}
                      </View>
                    )}
                  </>
                </View>
              </>
            ) : (
              <>
                {loading || (!music?.songs?.length && !error) ? (
                  <ActivityIndicator size="large" color="#000" />
                ) : error ? (
                  <Text style={styles.errorText}>
                    Something went wrong: {error.message}
                  </Text>
                ) : (
                  <FlatList
                    data={music?.songs || []}
                    windowSize={5}
                    showsVerticalScrollIndicator={false}
                    maxToRenderPerBatch={5}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                    renderItem={({ item, index }) => (
                      <>
                        <Trending
                          type={active}
                          song={item.song}
                          image={item.image}
                          music={item.music}
                          duration={item.duration}
                          primary_artists={item.primary_artists}
                          song_url={item.media_url}
                          index={index}
                          allSongs={music?.songs || []}
                        />
                      </>
                    )}
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
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export const styles = StyleSheet.create({
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

  section: {
    marginBottom: 10,
  },
  section2: {
    marginBottom: 200,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  flatList: {
    height: 180,
  },
  flatListContent: {
    paddingRight: 15,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
  },
});

export default Home;
