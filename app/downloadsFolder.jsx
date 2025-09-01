import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import backIcon from "@/assets/images/backImg.png";
import DownloadComponent from "@/components/downloadComponent";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
import { getDownloadsDirectory } from "@/utils/storage";

const PAGE_SIZE = 20; // Number of songs to load at once

const DownloadsFolder = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadedAll, setLoadedAll] = useState(false);
  const [page, setPage] = useState(0);

  // Clean song name for display
  const cleanSongName = (name) => {
    if (!name) return "Unknown";
    return String(name).replace(/_/g, " ").replace(/\s+/g, " ").trim();
  };

  const loadSongs = async () => {
    setLoading(true);
    try {
      // Get the new directory path first
      const NEW_DOWNLOAD_DIR = await getDownloadsDirectory();
      const OLD_DOWNLOAD_DIR = FileSystem.documentDirectory + "downloads/";

      // Read files based on storage type
      let allFiles = [];
      if (
        Platform.OS === "android" &&
        NEW_DOWNLOAD_DIR.startsWith("content://")
      ) {
        try {
          // Read files using SAF
          const newFiles =
            await FileSystem.StorageAccessFramework.readDirectoryAsync(
              NEW_DOWNLOAD_DIR
            );
          allFiles = newFiles.map((uri) => ({
            file: uri.split("/").pop(), // Get filename from URI
            dir: NEW_DOWNLOAD_DIR,
            uri: uri, // Keep full URI for SAF operations
          }));
        } catch (error) {
          console.log("Error reading SAF directory:", error);
        }
      } else {
        // Regular filesystem
        try {
          const newFiles = await FileSystem.readDirectoryAsync(
            NEW_DOWNLOAD_DIR
          );
          allFiles = newFiles.map((file) => ({ file, dir: NEW_DOWNLOAD_DIR }));
        } catch (error) {
          console.log("New directory not available:", error);

          // Only check old directory if new directory is empty
          try {
            const oldFiles = await FileSystem.readDirectoryAsync(
              OLD_DOWNLOAD_DIR
            );
            allFiles = oldFiles.map((file) => ({
              file,
              dir: OLD_DOWNLOAD_DIR,
            }));
          } catch (error) {
            console.log("Old directory not available:", error);
          }
        }
      }

      if (allFiles.length === 0) {
        setSongs([]);
        setFilteredSongs([]);
        setLoading(false);
        return;
      }

      // Create a Map for faster duplicate checking
      const uniqueFiles = Array.from(
        new Map(allFiles.map((item) => [item.file, item])).values()
      );

      // Prefer JSON files for metadata reading
      const jsonFiles = uniqueFiles.filter(({ file }) =>
        file.endsWith(".json")
      );

      if (jsonFiles.length === 0) {
        // Fallback to MP3 files if no JSON metadata
        const mp3Files = uniqueFiles.filter(({ file }) =>
          file.endsWith(".mp3")
        );
        if (mp3Files.length === 0) {
          setSongs([]);
          setFilteredSongs([]);
          setLoading(false);
          return;
        }

        // Create song objects from MP3 files (less metadata)
        const songData = await Promise.all(
          mp3Files.map(async ({ file, dir }) => {
            const baseName = file.replace(".mp3", "");
            return {
              id: baseName,
              song: cleanSongName(baseName),
              filePath: dir + file,
              image: null,
              primary_artists: "Unknown Artist",
              duration: 0,
              downloadedAt: new Date().toISOString(), // Default date
            };
          })
        );

        setSongs(songData);
        setFilteredSongs(songData);
        setLoading(false);
        return;
      }

      // Create song objects with complete metadata from JSON files
      const songData = await Promise.all(
        jsonFiles.map(async ({ file, dir, uri }) => {
          try {
            let jsonContent;
            if (
              Platform.OS === "android" &&
              dir.startsWith("content://") &&
              uri
            ) {
              // Read using SAF
              jsonContent =
                await FileSystem.StorageAccessFramework.readAsStringAsync(uri);
            } else {
              // Regular filesystem
              const jsonPath = dir + file;
              jsonContent = await FileSystem.readAsStringAsync(jsonPath);
            }
            const metadata = JSON.parse(jsonContent);

            // First check the path stored in metadata
            if (metadata.filePath) {
              try {
                let exists = false;
                if (
                  Platform.OS === "android" &&
                  metadata.filePath.startsWith("content://")
                ) {
                  // For SAF paths, try to read the file to check existence
                  try {
                    await FileSystem.StorageAccessFramework.readAsStringAsync(
                      metadata.filePath,
                      { length: 1 }
                    );
                    exists = true;
                  } catch (e) {
                    exists = false;
                  }
                } else {
                  // Regular filesystem
                  const fileInfo = await FileSystem.getInfoAsync(
                    metadata.filePath
                  );
                  exists = fileInfo.exists;
                }

                if (exists) {
                  return {
                    id: metadata.id || file.replace(".json", ""),
                    song:
                      metadata.song ||
                      metadata.name ||
                      cleanSongName(metadata.id),
                    filePath: metadata.filePath,
                    image: metadata.image || null,
                    primary_artists:
                      metadata.primary_artists ||
                      metadata.artist ||
                      metadata.music ||
                      "Unknown Artist",
                    duration: metadata.duration || 0,
                    downloadedAt:
                      metadata.downloadedAt || new Date().toISOString(),
                  };
                }
              } catch (error) {
                console.log("Error checking metadata path:", error);
              }
            }

            // If metadata path fails, check the same directory as the JSON
            const mp3FileName = `${metadata.id}.mp3`;
            const mp3Path = dir + mp3FileName;
            const exists = await FileSystem.getInfoAsync(mp3Path);

            if (!mp3Exists || !mp3Path) {
              console.log(`MP3 file not found for ${file}`);
              return null;
            }

            // If the file was found in the old location, try to migrate it
            if (mp3Path.startsWith(OLD_DOWNLOAD_DIR)) {
              try {
                const newMp3Path = NEW_DOWNLOAD_DIR + mp3FileName;
                await FileSystem.copyAsync({
                  from: mp3Path,
                  to: newMp3Path,
                });
                // Also migrate the JSON file if it's in the old location
                if (jsonPath.startsWith(OLD_DOWNLOAD_DIR)) {
                  await FileSystem.copyAsync({
                    from: jsonPath,
                    to: NEW_DOWNLOAD_DIR + file,
                  });
                }
                mp3Path = newMp3Path;
              } catch (migrationError) {
                console.log(
                  "Migration failed, using original path:",
                  migrationError
                );
              }
            }

            return {
              id: metadata.id || file.replace(".json", ""),
              song:
                metadata.song ||
                metadata.name ||
                cleanSongName(metadata.id || file.replace(".json", "")),
              filePath: mp3Path,
              image: metadata.image || null,
              primary_artists:
                metadata.primary_artists ||
                metadata.artist ||
                metadata.music ||
                "Unknown Artist",
              duration: metadata.duration || 0,
              downloadedAt: metadata.downloadedAt || new Date().toISOString(),
            };
          } catch (e) {
            console.log(`Error loading metadata for ${jsonFile}:`, e);
            return null;
          }
        })
      );

      // Filter out null entries (failed loads)
      const validSongs = songData.filter((song) => song !== null);

      // Sort by download date, newest first
      validSongs.sort((a, b) => {
        const dateA = new Date(a.downloadedAt);
        const dateB = new Date(b.downloadedAt);
        return dateB - dateA; // Descending order (newest first)
      });

      setSongs(validSongs);
      setFilteredSongs(validSongs);
    } catch (e) {
      console.log("Error loading songs:", e);
    } finally {
      setLoading(false);
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
    if (showSearch) {
      handleClearSearch();
    }
  };

  const handleSearchQuery = (text) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredSongs(songs);
    } else {
      const results = songs.filter(
        (item) =>
          item.song?.toLowerCase().includes(text.toLowerCase()) ||
          item.primary_artists?.toLowerCase().includes(text.toLowerCase())
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

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.textFont} className="mt-4">
            Loading downloads...
          </Text>
        </View>
      ) : songs.length < 1 ? (
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
            data={filteredSongs.slice(0, (page + 1) * PAGE_SIZE)}
            keyExtractor={(item) => item.id || item.filePath}
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
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (!loadedAll && filteredSongs.length > (page + 1) * PAGE_SIZE) {
                setPage(page + 1);
              }
            }}
            onEndReachedThreshold={0.5}
            initialNumToRender={PAGE_SIZE}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
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
