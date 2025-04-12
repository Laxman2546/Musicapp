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
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import backIcon from "@/assets/images/backImg.png";
import DownloadComponent from "@/components/downloadComponent";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";

const DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";

const DownloadsFolder = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadSongs = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(DOWNLOAD_DIR);
      console.log("All files:", files);

      // Filter only .mp3 files
      const mp3Files = files.filter((file) => file.endsWith(".mp3"));
      console.log("MP3 files:", mp3Files);

      // Filter corresponding .json files for metadata
      const jsonFiles = files.filter((file) => file.endsWith(".json"));
      console.log("JSON files:", jsonFiles);

      // Create song objects
      const songData = await Promise.all(
        mp3Files.map(async (fileName) => {
          const baseName = fileName.replace(".mp3", "");

          // Find corresponding JSON metadata file
          const jsonFile = jsonFiles.find((jsonFile) =>
            jsonFile.includes(baseName)
          );

          let metadata = {
            image: null,
            primary_artists: "Unknown",
            duration: "Unknown",
          };

          if (jsonFile) {
            const jsonContent = await FileSystem.readAsStringAsync(
              DOWNLOAD_DIR + jsonFile
            );
            metadata = JSON.parse(jsonContent); // Assuming the metadata structure in JSON
          }

          return {
            song: baseName,
            filePath: DOWNLOAD_DIR + fileName,
            image: metadata.image || null,
            primary_artists:
              metadata.primary_artists || metadata.music || "Unknown",
            duration: metadata.duration || "Unknown",
          };
        })
      );

      setSongs(songData);
      setFilteredSongs(songData);
    } catch (e) {
      console.log("Error loading songs:", e);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSearch = () => {
    setShowSearch(!showSearch);
    handleClearSearch();
  };

  const handleSearchQuery = (text) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredSongs(songs);
    } else {
      const results = songs.filter((item) =>
        item.song.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSongs(results);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredSongs(songs);
  };

  return (
    <View style={{ flex: 1 }} className="p-5">
      <View className="flex flex-row gap-3 items-center">
        <Pressable onPress={handleBack}>
          <View className="p-3 rounded-full bg-[#222]">
            <Image source={backIcon} style={styles.backImg} />
          </View>
        </Pressable>
        <Text style={styles.textStyle}>Downloads</Text>
      </View>

      {songs.length < 1 ? (
        <View className="flex-1 items-center justify-center">
          <Text style={styles.textFont}>No Downloads found 😐</Text>
          <Text style={styles.textFont}>Try downloading the songs....</Text>
        </View>
      ) : (
        <>
          <View className="w-full flex flex-row items-center justify-between p-4">
            <Pressable onPress={handleSearch}>
              <Image
                source={showSearch ? closeImg : searchImg}
                style={styles.searchIcon}
              />
            </Pressable>
          </View>

          {showSearch && (
            <View className="w-full p-4">
              <View className="relative">
                <Pressable style={styles.searchImg}>
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
                  placeholder={`Search in Downloads`}
                  onChangeText={handleSearchQuery}
                  value={searchQuery}
                  returnKeyType="search"
                />
              </View>
            </View>
          )}

          <FlatList
            data={filteredSongs}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <DownloadComponent
                song={item.song}
                image={item.image}
                song_url={item.filePath}
                primary_artists={item.primary_artists}
                duration={item.duration}
                index={index}
                allSongs={filteredSongs}
                onDelete={loadSongs}
              />
            )}
            ListFooterComponent={
              <View className="w-full items-center mb-[90px]">
                {searchQuery ? (
                  filteredSongs.length > 0 ? (
                    <Text style={styles.fontStyle}>
                      Found {filteredSongs.length} song
                      {filteredSongs.length > 1 ? "s" : ""} 😊
                    </Text>
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
        </>
      )}
    </View>
  );
};

export default DownloadsFolder;

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
