import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
import { fetchMusic, searchSongs } from "@/services/api";
import useFetch from "@/services/useFetch";
import Trending from "@/components/trending";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  // Debounce function for search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && searchQuery.length > 1) {
        setDebouncedQuery(searchQuery);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    }, 500); // 500ms delay before triggering search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: music,
    loading,
    error,
    refetch,
    reset,
  } = useFetch(() => fetchMusic({ query: debouncedQuery }), [debouncedQuery]);

  // Update suggestions when search results arrive
  useEffect(() => {
    if (music?.results && music.results.length > 0) {
      // Limit to top 5 suggestions for better UX
      setSuggestions(music.results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [music]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedSong(null);
    setShowSuggestions(false);
    reset();
  };

  const handleSearchQuery = (query) => {
    if (!query) return;
    setDebouncedQuery(query);
  };

  const handleSelectSuggestion = (song, index) => {
    setSearchQuery(song.name);
    setSelectedSong({ song, index });
    setShowSuggestions(false);
  };

  const handleViewAllResults = () => {
    setShowSuggestions(false);
    // This will display all results below
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

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={`${item.id}-${index}`}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item, index)}
                >
                  <Image
                    source={{ uri: item.image[0].url }}
                    style={styles.suggestionImage}
                  />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.suggestionArtist} numberOfLines={1}>
                      {item.artists.primary.map((a) => a.name).join(", ")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleViewAllResults}
              >
                <Text style={styles.viewAllText}>View all results</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="pr-5 mt-3">
          {searchQuery === "" ? (
            <Text style={styles.hintText}>Search for your favorite songs</Text>
          ) : loading ? (
            <View className="items-center mt-10">
              <ActivityIndicator size={"large"} color={"#000"} />
              <Text className="text-black mt-2" style={styles.loadingText}>
                Searching...
              </Text>
            </View>
          ) : error ? (
            <Text className="text-red-600 mt-5" style={styles.textFont}>
              Error: {error.message}
            </Text>
          ) : (
            <>
              {selectedSong ? (
                // Show only the selected song
                <View className="mt-4">
                  <Text style={styles.resultHeading}>Selected Song</Text>
                  <Trending
                    song={selectedSong.song.name}
                    image={selectedSong.song.image[2].url}
                    music={
                      selectedSong.song.downloadUrl[4].url ||
                      selectedSong.song.downloadUrl[3].url
                    }
                    duration={selectedSong.song.duration}
                    primary_artists={selectedSong.song.artists.primary.map(
                      (a) => a.name
                    )}
                    song_url={
                      selectedSong.song.downloadUrl[4].url ||
                      selectedSong.song.downloadUrl[3].url
                    }
                    allSongs={music?.results || []}
                    index={selectedSong.index}
                  />

                  {/* Related songs section */}
                  {music?.results && music.results.length > 1 && (
                    <>
                      <Text style={styles.relatedHeading}>
                        You might also like
                      </Text>
                      <FlatList
                        data={music.results
                          .filter((_, idx) => idx !== selectedSong.index)
                          .slice(0, 5)}
                        className="mb-[500px]"
                        renderItem={({ item, index }) => (
                          <Trending
                            song={item.name}
                            image={item.image[2].url}
                            music={
                              item.downloadUrl[4].url || item.downloadUrl[3].url
                            }
                            duration={item.duration}
                            primary_artists={item.artists.primary.map(
                              (a) => a.name
                            )}
                            song_url={
                              item.downloadUrl[4].url || item.downloadUrl[3].url
                            }
                            allSongs={music?.results || []}
                            index={index}
                          />
                        )}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        windowSize={5}
                        maxToRenderPerBatch={5}
                        updateCellsBatchingPeriod={50}
                        removeClippedSubviews={true}
                      />
                    </>
                  )}
                </View>
              ) : !showSuggestions && music?.results ? (
                // Show all search results when no song is selected
                <>
                  <Text style={styles.resultHeading}>
                    {music?.results.length > 0
                      ? `Search results for "${searchQuery}"`
                      : `No results found for "${searchQuery}"`}
                  </Text>
                  <FlatList
                    data={music?.results || []}
                    className="mb-[500px]"
                    renderItem={({ item, index }) => (
                      <Trending
                        song={item.name}
                        image={item.image[2].url}
                        music={
                          item.downloadUrl[4].url || item.downloadUrl[3].url
                        }
                        duration={item.duration}
                        primary_artists={item.artists.primary.map(
                          (a) => a.name
                        )}
                        song_url={
                          item.downloadUrl[4].url || item.downloadUrl[3].url
                        }
                        allSongs={music?.results || []}
                        index={index}
                      />
                    )}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    windowSize={5}
                    maxToRenderPerBatch={5}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                  />
                </>
              ) : null}
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
  suggestionsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 2,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 100,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  suggestionArtist: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "#666",
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  viewAllText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#007AFF",
  },
  resultHeading: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 4,
  },
  relatedHeading: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  hintText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#666",
    marginTop: 20,
    textAlign: "center",
  },
  loadingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
  },
});
