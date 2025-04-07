import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMusic } from "@/services/api";
import backIcon from "@/assets/images/previous.png";
import Trending from "@/components/trending";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
const Premlist = () => {
  const { premaUrl, listname, designImage } = useLocalSearchParams();
  const { data, loading, error, refetch } = useFetch(
    () => fetchMusic({ premaUrl }),
    [premaUrl]
  );
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const imageSource = (image) => {
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
  };

  const handleBack = () => {
    router.back();
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
    const songsData = data.songs;
    const filteredResults = songsData.filter((item) =>
      item.song.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filteredResults);
  };
  return (
    <View>
      <View className="relative">
        <Pressable onPress={handleBack} className="z-50">
          <Image
            className="absolute left-4 top-6"
            source={backIcon}
            style={{ width: 35, height: 35 }}
          />
        </Pressable>
        <Image
          source={imageSource(designImage)}
          resizeMode="contain"
          style={styles.designImage}
        />
      </View>

      <View className="p-3 ml-4">
        <View className="w-full flex flex-row items-center justify-between p-4">
          <View>
            <Text style={styles.fontStyle}>{listname || "Nanimusic"}</Text>
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

        <View>
          <View className="mb-[2px]">
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
                    placeholder={`Search songs`}
                    onChangeText={handleSearchQuery}
                    value={searchQuery}
                    enterKeyHint="search"
                    onSubmitEditing={() => handleSearchQuery(searchQuery)}
                    returnKeyType="search"
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        {loading || (!data && !error) ? (
          <ActivityIndicator size="large" color="#000" />
        ) : error ? (
          <View className="w-full flex flex-col gap-3 items-center justify-center">
            <Text style={styles.errorText}>
              Something went wrong :😥 {error.message}
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
          <View className="mb-[1000px]">
            <FlatList
              data={
                searchQuery && filteredSongs
                  ? filteredSongs
                  : Array.isArray(data?.songs)
                  ? data.songs
                  : []
              }
              contentContainerStyle={{ paddingBottom: 80 }}
              windowSize={5}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={true}
              showsVerticalScrollIndicator={false}
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
                <View className="w-full items-center mb-[50px]">
                  {searchQuery ? (
                    filteredSongs.length > 0 ? (
                      <View className="mb-[250px]">
                        <Text style={styles.fontStyle}>{`Found ${
                          filteredSongs.length
                        } song${filteredSongs.length > 1 ? "s" : ""} 😊`}</Text>
                      </View>
                    ) : (
                      <Text style={styles.fontStyle}>No songs found 😥</Text>
                    )
                  ) : (
                    <Text style={styles.fontStyle}>
                      You have reached the end ✨
                    </Text>
                  )}
                </View>
              }
              keyExtractor={(item, index) => `${item.song}-${index}`}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Premlist;

const styles = StyleSheet.create({
  designImage: {
    width: "100%",
    height: 250,
  },
  fontStyle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
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
  errorText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "red",
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
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
