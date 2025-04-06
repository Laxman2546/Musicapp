import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { goBack } from "expo-router/build/global-state/routing";
import backIcon from "@/assets/images/backImg.png";
import { router } from "expo-router";
import DownloadComponent from "@/components/downloadComponent";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
const downloadsFolder = () => {
  const [songs, setSongs] = React.useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const loadSongs = async () => {
    try {
      const data = await AsyncStorage.getItem("downloadedSongs");
      setSongs(data ? JSON.parse(data) : []);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    loadSongs();
  }, []);

  const handleBack = () => {
    router.push(goBack);
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
    const songsData = songs;
    const filteredResults = songsData.filter((item) =>
      item.song.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filteredResults);
  };
  return (
    <>
      <View className="p-5">
        <View className="flex flex-row gap-3 items-center">
          <Pressable onPress={handleBack}>
            <View className="p-3 rounded-full bg-[#222]">
              <Image source={backIcon} style={styles.backImg} />
            </View>
          </Pressable>
          <Text style={styles.textStyle}>Downloads</Text>
        </View>
        {songs.length < 1 ? (
          <>
            <View className="w-full h-screen flex items-center justify-center">
              <Text style={styles.textFont}>No Downloads found 😐</Text>
              <Text style={styles.textFont}>Try downloading the songs....</Text>
            </View>
          </>
        ) : (
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
                        placeholder={`Search in Downloads`}
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
            <View>
              <FlatList
                data={
                  searchQuery && filteredSongs ? filteredSongs : songs || []
                }
                className="mb-16"
                renderItem={({ item, index }) => (
                  <>
                    <DownloadComponent
                      song={item.song}
                      image={item.image}
                      song_url={item.filePath}
                      primary_artists={item.primary_artists}
                      duration={item.duration}
                      index={index}
                      allSongs={songs || []}
                      onDelete={loadSongs}
                    />
                  </>
                )}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                  <View className="w-full items-center mb-[90px]">
                    {searchQuery ? (
                      filteredSongs.length > 0 ? (
                        <View className="mb-[250px]">
                          <Text style={styles.fontStyle}>{`Found ${
                            filteredSongs.length
                          } song${
                            filteredSongs.length > 1 ? "s" : ""
                          } 😊`}</Text>
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
              />
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default downloadsFolder;

const styles = StyleSheet.create({
  backImg: {
    width: 15,
    height: 15,
    borderRadius: 25,
  },
  textStyle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
  },
  textFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#333",
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
    position: "absolute",
    right: 0,
    top: -45,
    zIndex: 50,
  },
  fontStyle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});
