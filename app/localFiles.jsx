import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import backIcon from "@/assets/images/backImg.png";
import { router } from "expo-router";
import Trending from "@/components/trending";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";

const localFiles = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
  const handleBack = () => {
    router.back();
  };
  const getSongs = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 1000,
      });

      const songDetails = await Promise.all(
        media.assets.map(async (song) => {
          const songInfo = await MediaLibrary.getAssetInfoAsync(song.id);
          let artwork = null;

          // Try to get artwork from album
          try {
            if (songInfo.albumId) {
              const album = await MediaLibrary.getAlbumAsync(songInfo.albumId);
              if (album?.coverImage) {
                artwork = album.coverImage;
              }
            }

            // Fallback: Try the asset's own uri if it has embedded artwork
            if (!artwork) {
              artwork = songInfo.uri;
            }
          } catch (error) {
            console.log("Error getting album artwork:", error);
          }

          return {
            id: song.id,
            song: songInfo.filename.replace(/\.[^/.]+$/, ""),
            music: song.uri,
            duration: songInfo.duration,
            image: artwork,
          };
        })
      );
      const sortedSongs = songDetails.sort((a, b) =>
        a.song.localeCompare(b.song)
      );
      setLoading(false);
      setSongs(sortedSongs);
    }
  };
  useEffect(() => {
    setLoading(true);
    getSongs();
  }, []);

  return (
    <>
      <View className="p-5">
        <View className="flex flex-row gap-3 items-center">
          <Pressable onPress={handleBack}>
            <View className="p-3 rounded-full bg-[#222]">
              <Image source={backIcon} style={styles.backImg} />
            </View>
          </Pressable>
          <Text style={styles.textStyle}>LocalSongs</Text>
        </View>
        {loading ? (
          <>
            <View className="w-full h-screen flex items-center justify-center">
              <Text style={styles.textFont}>
                Loading your local songs... 😚
              </Text>
            </View>
          </>
        ) : (
          <>
            {songs.length < 1 ? (
              <>
                <View className="w-full h-screen flex items-center justify-center">
                  <Text style={styles.textFont}>No Local songs found 😐</Text>
                  <Text style={styles.textFont}>Check the premissions</Text>
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
                              <Image
                                source={closeImg}
                                style={styles.cancelImg}
                              />
                            </Pressable>
                          )}
                          <TextInput
                            style={styles.SearchtextFont}
                            className="bg-gray-200 w-full p-4 pl-10 rounded-md"
                            placeholder={`Search in Localsongs`}
                            onChangeText={handleSearchQuery}
                            value={searchQuery}
                            enterKeyHint="search"
                            onSubmitEditing={() =>
                              handleSearchQuery(searchQuery)
                            }
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
                    className="mb-20"
                    renderItem={({ item, index }) => (
                      <>
                        <Trending
                          song={item.song}
                          image={item.image}
                          music={"Nanimusic..."}
                          duration={item.duration}
                          primary_artists={"Nanimusic..."}
                          song_url={item.music}
                          index={index}
                          allSongs={songs || []}
                          isdownloadedSongs={true}
                        />
                      </>
                    )}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    ListFooterComponent={
                      <View className="w-full items-center mb-[50px]">
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
                            <Text style={styles.fontStyle}>
                              No songs found 😥
                            </Text>
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
          </>
        )}
      </View>
    </>
  );
};

export default localFiles;

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
