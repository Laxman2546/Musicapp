import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
const [filteredSongs, setFilteredSongs] = useState([]);
const [showSearch, setShowSearch] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const searchComponent = () => {
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
    <>
      <View className="w-full flex flex-row items-center justify-between p-4">
        <View>
          <Pressable onPress={handleSearch}>
            <Image
              source={showSearch ? closeImg : searchImg}
              style={styles.searchIcon}
            />
          </Pressable>
        </View>
      </View>
      <View className="w-full p-4">
        <View className="relative">
          <Pressable
            style={styles.searchImg}
            onPress={() => handleSearchQuery(searchQuery)}
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
    </>
  );
};

export default searchComponent;

export const styles = StyleSheet.create({});
