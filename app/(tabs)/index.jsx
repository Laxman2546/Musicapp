import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Image,
  Text,
  View,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeBtns from "../../components/homeBtns";
import Trending from "../../components/trending";
import useFetch from "@/services/useFetch";
import { fetchMusic, getNextPlaylist } from "../../services/api";
import ChartsComponent from "@/components/chartsComponent";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";

const Home = () => {
  const [active, setActive] = useState("All");
  const [bhakthiActive, setbhakthiActive] = useState("VenkateshwaraSwamy");
  const [greetings, setGreetings] = useState("Good Morning");
  const [userName, setuserName] = useState("user");
  const [filteredSongs, setFilteredSongs] = useState([]);

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = () => {
    setShowSearch(!showSearch);
    handleClearSearch();
  };
  const handleSearchQuery = (searchQuery) => {
    setSearchQuery(searchQuery);
    if (!searchQuery) {
      return;
    }
    searchResults(searchQuery);
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredSongs([]);
  };
  const searchResults = (searchQuery) => {
    const songsData = music.songs;
    const filteredResults = songsData.filter((item) =>
      item.song.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filteredResults);
  };
  const getUser = async () => {
    const getuserName = await AsyncStorage.getItem("profileName");
    setuserName(getuserName);
  };
  useFocusEffect(
    useCallback(() => {
      getUser();
    }, [])
  );
  useEffect(() => {
    // Set up notification handling
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    // Listen for notification actions
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { actionIdentifier, notification } = response;

        if (actionIdentifier === "pause") {
          // Handle pause action
          setIsPlaying(false);
        } else if (actionIdentifier === "play") {
          // Handle play action
          setIsPlaying(true);
        } else if (actionIdentifier === "next") {
          // Handle next action
          playNext();
        }
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView className="bg-slate-50 h-full">
      <View className="w-full">
        <View className="w-full flex pt-10 pl-5 gap-1">
          <Text style={styles.greetingText}>
            Hello,
            <Text style={styles.activeText}>{userName || "user"}</Text>
          </Text>
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
              btnName="English"
              handlePress={() => {
                setActive("English");
                setEndReached(false);
              }}
              btnactive={active}
            />
            <HomeBtns
              btnName="Hindi"
              handlePress={() => {
                setActive("Hindi");
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
                  <View className="w-full flex flex-col gap-3 items-center justify-center">
                    <Text style={styles.errorText}>
                      Something went wrong😥: {error.message}
                    </Text>
                    <Pressable onPress={refetch}>
                      <View className=" p-3 pl-5 pr-5 bg-black color-white rounded-xl">
                        <Text
                          style={styles.loadingText}
                          className="color-white"
                        >
                          Retry
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    <View style={styles.section}>
                      <View>
                        <Text style={styles.activeText}>
                          Top charts -telugu
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
                          Top playlists - Hindi
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
            <View className="w-full flex flex-row pt-5 pl-5 items-center justify-between pr-8">
              <View>
                <Text style={styles.activeText}>
                  {active === "Recent"
                    ? `${active} Release`
                    : `${active} Songs`}
                </Text>
              </View>
              <View>
                <Pressable onPress={handleSearch}>
                  <Image
                    source={showSearch ? closeImg : searchImg}
                    style={styles.searchIcon}
                  />
                </Pressable>
              </View>
            </View>

            {loading || (!music?.songs?.length && !error) ? (
              <ActivityIndicator size="large" color="#000" />
            ) : error ? (
              <View className="w-full flex flex-col gap-3 items-center justify-center">
                <Text style={styles.errorText}>
                  Something went wrong: {error.message}
                </Text>
                <Pressable onPress={refetch}>
                  <View className=" p-3 pl-5 pr-5 bg-black color-white rounded-xl">
                    <Text style={styles.loadingText} className="color-white">
                      Retry
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : (
              <>
                {showSearch && (
                  <View className="w-full p-4">
                    <View className="relative">
                      <Pressable
                        style={styles.searchImg}
                        onPress={() => handleSearchQuery(searchQuery)}
                      >
                        <Image source={searchImg} style={styles.img} />
                      </Pressable>
                      {searchQuery && (
                        <Pressable
                          onPress={handleClearSearch}
                          style={styles.cancel}
                        >
                          <Image source={closeImg} style={styles.cancelImg} />
                        </Pressable>
                      )}
                      <TextInput
                        style={styles.SearchtextFont}
                        className="bg-gray-200 w-full p-4 pl-10 rounded-md"
                        placeholder={`Search in ${active} songs`}
                        onChangeText={handleSearchQuery}
                        value={searchQuery}
                        enterKeyHint="search"
                        onSubmitEditing={() => handleSearchQuery(searchQuery)}
                        returnKeyType="search"
                      />
                    </View>
                  </View>
                )}

                <FlatList
                  data={
                    searchQuery && filteredSongs.length > 0
                      ? filteredSongs
                      : music?.songs || []
                  }
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
                    searchQuery ? (
                      <>
                        <View className="w-full  flex items-center">
                          <Text style={styles.footerText}>
                            end of search results for {searchQuery} 🧐
                          </Text>
                        </View>
                      </>
                    ) : loadingMore ? (
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
    fontSize: 22,
  },
  greetingName2: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
  },
  activeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  errorText: {
    fontFamily: "Poppins-SemiBold",
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
  textFont: {
    fontFamily: "Nunito-Bold",
    fontSize: 25,
  },
  SearchtextFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    height: 60,
    paddingRight: 100,
  },
  img: {
    width: 18,
    height: 18,
    top: 25,
    zIndex: 50,
  },
  cancel: {
    position: "absolute",
    top: 25,
    right: 0,
    zIndex: 15,
  },
  cancelImg: {
    width: 20,
    height: 20,
    position: "absolute",
    top: -4,
    right: 80,
    zIndex: 15,
  },
  searchImg: {
    width: 20,
    height: 20,
    zIndex: 50,
    position: "absolute",
    right: 35,
    top: -4,
  },
  searchIcon: {
    width: 20,
    height: 20,
    zIndex: 50,
  },
});

export default Home;
