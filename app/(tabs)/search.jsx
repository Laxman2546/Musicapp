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

  const {
    data: music,
    loading,
    error,
    refetch,
    reset,
  } = useFetch(() => fetchMusic({ query: debouncedQuery }), [debouncedQuery]);

  const handleClearSearch = () => {
    setSearchQuery("");
    reset();
  };

  const handleSearchQuery = (searchQuery) => {
    if (!searchQuery) {
      return;
    }
    setDebouncedQuery(searchQuery);
  };

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
            onChangeText={setSearchQuery}
            value={searchQuery}
            enterKeyHint="search"
            onSubmitEditing={() => handleSearchQuery(searchQuery)}
            returnKeyType="search"
          />
        </View>
        {/* Safely check if music and music.results exist before accessing */}
        <View className="pr-5 mt-3">
          {searchQuery === "" ? (
            ""
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
              {music && music.results && (
                <Text style={styles.SearchtextFont}>
                  {music.results.length > 0
                    ? `Search results for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`}
                </Text>
              )}
              <FlatList
                data={music && music.results ? music.results : []}
                className="mb-[500px]"
                renderItem={({ item, index }) => {
                  if (!searchQuery) return null;

                  // Add null checks for item and its properties
                  if (
                    !item ||
                    !item.name ||
                    !item.artists ||
                    !item.artists.primary
                  ) {
                    return null;
                  }

                  // Make sure downloadUrl exists and has elements
                  const downloadUrl =
                    item.downloadUrl &&
                    (item.downloadUrl[4]?.url || item.downloadUrl[3]?.url);

                  if (!downloadUrl) {
                    return null;
                  }

                  // Generate a unique ID for this song
                  const songId = generateUniqueId(
                    item.name,
                    item.artists.primary.map((a) => a.name),
                    item.duration
                  );

                  return (
                    <Trending
                      id={songId}
                      song={item.name}
                      image={item.image}
                      music={downloadUrl}
                      duration={item.duration}
                      primary_artists={item.artists.primary
                        .map((a) => a.name)
                        .join(", ")}
                      song_url={downloadUrl}
                      allSongs={music.results || []}
                      index={index}
                    />
                  );
                }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => {
                  // Handle potential null items
                  if (!item) return `index_${index}`;

                  return (
                    item.id ||
                    generateUniqueId(
                      item.name || "",
                      item.artists?.primary?.map((a) => a.name) || [],
                      item.duration || 0
                    )
                  );
                }}
                windowSize={5}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={true}
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
