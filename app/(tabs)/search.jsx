import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
import { fetchMusic } from "@/services/api";
import useFetch from "@/services/useFetch";
import Trending from "@/components/trending";

// Helper function to generate a unique ID for each song
const generateUniqueId = (song, artists, duration) => {
  const artistString = Array.isArray(artists)
    ? artists.join("_")
    : typeof artists === "string"
    ? artists
    : "unknown";

  return `${song
    .replace(/[^a-z0-9\-_ ]/gi, "")
    .replace(/\s+/g, "_")}_${artistString
    .replace(/[^a-z0-9\-_ ]/gi, "")
    .replace(/\s+/g, "_")}_${duration}`;
};

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const {
    data: searchResults,
    loading,
    error,
    refetch,
    reset,
  } = useFetch(() => fetchMusic({ query: debouncedQuery }), [debouncedQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    reset();
  };

  const handleSearchQuery = (searchQuery) => {
    // Clear any existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (!searchQuery) {
      setDebouncedQuery("");
      reset();
      return;
    }

    // Set a new timeout
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); // 500ms debounce time

    // Save the timeout ID so we can clear it if needed
    setDebounceTimeout(timeout);
  };

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  console.log("Search results:", searchResults);

  return (
    <SafeAreaView>
      <View className="pt-10 pl-5">
        <Text style={styles.textFont}>Search</Text>
        <View className="pr-5 relative">
          <Pressable
            style={styles.searchImg}
            onPress={() => handleSearchQuery(searchQuery)}
            hitSlop={10}
          >
            <Image source={searchImg} style={styles.img} />
          </Pressable>
          {searchQuery && (
            <Pressable onPress={handleClearSearch} style={styles.cancel}>
              <Image source={closeImg} style={styles.cancelImg} />
            </Pressable>
          )}
          <TextInput
            style={styles.SearchtextFont}
            className="bg-gray-200 w-full mt-3 p-4 pl-10 rounded-md"
            placeholder="Search for a song"
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearchQuery(text);
            }}
            value={searchQuery}
            enterKeyHint="search"
            returnKeyType="search"
          />
        </View>
        <View className="pr-5 mt-3">
          {searchQuery === "" ? (
            <Text style={styles.SearchtextFont}>Search for music...</Text>
          ) : loading ? (
            <View className="items-center mt-10">
              <Text className="text-black" style={styles.textFont}>
                Searching...
              </Text>
              <ActivityIndicator size={"large"} color={"#000"} />
            </View>
          ) : error ? (
            <Text className="text-red-600 mt-5" style={styles.textFont}>
              Error: {error.message}
            </Text>
          ) : (
            <>
              <Text style={styles.SearchtextFont}>
                {searchResults && searchResults.length > 0
                  ? `Search results for "${searchQuery}"`
                  : `No results found for "${searchQuery}"`}
              </Text>
              <FlatList
                data={searchResults || []}
                className="mb-[500px]"
                renderItem={({ item, index }) => {
                  if (!searchQuery) return null;

                  // Add null checks for item
                  if (!item) return null;

                  return (
                    <Trending
                      song={item.song}
                      image={item.image}
                      music={item.media_url}
                      duration={item.duration}
                      primary_artists={item.primary_artists}
                      song_url={item.media_url}
                      allSongs={searchResults || []}
                      index={index}
                    />
                  );
                }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => {
                  if (!item) return `index_${index}`;
                  return item.id || `index_${index}`;
                }}
                windowSize={5}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={true}
                ListEmptyComponent={() => (
                  <View className="items-center mt-10">
                    <Text style={styles.textFont}>No songs found</Text>
                  </View>
                )}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Search;

const styles = StyleSheet.create({
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
    top: 5,
    right: 80,
    zIndex: 15,
  },
  searchImg: {
    width: 20,
    height: 20,
    zIndex: 50,
    position: "absolute",
    right: 35,
    top: 5,
  },
});
