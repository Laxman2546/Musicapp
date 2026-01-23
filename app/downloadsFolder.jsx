import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "@react-navigation/native";
import DownloadComponent from "@/components/downloadComponent";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
import {
  getDownloadsDirectory,
  findDownloadsDirectory,
  diagnoseDownloadsLocation,
  clearDownloadsDirCache,
} from "@/utils/storage";

const DownloadsFolder = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadDir, setDownloadDir] = useState("");

  // Clean song name for display
  const cleanSongName = (name) => {
    if (!name) return "Unknown";
    return String(name).replace(/_/g, " ").replace(/\s+/g, " ").trim();
  };

  const loadSongs = async () => {
    setLoading(true);
    try {
      // Clear cache to ensure fresh directory lookup
      clearDownloadsDirCache();

      // Run diagnostic on load
      await diagnoseDownloadsLocation();

      // Get the downloads directory - checks all possible locations
      const dir = await findDownloadsDirectory();
      setDownloadDir(dir);

      console.log("📂 Loading songs from:", dir);

      // Ensure downloads directory exists
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        console.log("Directory does not exist, creating...");
        await FileSystem.makeDirectoryAsync(dir, {
          intermediates: true,
        });
        setSongs([]);
        setFilteredSongs([]);
        setLoading(false);
        return;
      }

      const files = await FileSystem.readDirectoryAsync(dir);
      console.log("Files found:", files);

      // Prefer JSON files for metadata reading
      const jsonFiles = files.filter((file) => file.endsWith(".json"));
      console.log(`Found ${jsonFiles.length} JSON metadata files`);

      if (jsonFiles.length === 0) {
        // Fallback to MP3 files if no JSON metadata
        const mp3Files = files.filter((file) => file.endsWith(".mp3"));
        console.log(`Found ${mp3Files.length} MP3 files`);

        if (mp3Files.length === 0) {
          console.log("No downloads found");
          setSongs([]);
          setFilteredSongs([]);
          setLoading(false);
          return;
        }

        // Create song objects from MP3 files (less metadata)
        const songData = await Promise.all(
          mp3Files.map(async (fileName) => {
            const baseName = fileName.replace(".mp3", "");
            return {
              id: baseName,
              song: cleanSongName(baseName),
              filePath: `${dir}${fileName}`,
              image: null,
              primary_artists: "Unknown Artist",
              duration: 0,
              downloadedAt: new Date().toISOString(), // Default date
            };
          }),
        );

        setSongs(songData);
        setFilteredSongs(songData);
        setLoading(false);
        return;
      }

      // Create song objects with complete metadata from JSON files
      const songData = await Promise.all(
        jsonFiles.map(async (jsonFile) => {
          try {
            const jsonPath = `${dir}${jsonFile}`;
            const jsonContent = await FileSystem.readAsStringAsync(jsonPath);
            const metadata = JSON.parse(jsonContent);

            // Check if the MP3 file exists
            const mp3Path = metadata.filePath || `${dir}${metadata.id}.mp3`;
            const mp3Exists = await FileSystem.getInfoAsync(mp3Path);

            if (!mp3Exists.exists) {
              console.log(`MP3 file not found for ${jsonFile}`);
              return null;
            }

            return {
              id: metadata.id || jsonFile.replace(".json", ""),
              song:
                metadata.song ||
                metadata.name ||
                cleanSongName(metadata.id || jsonFile.replace(".json", "")),
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
        }),
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

  useFocusEffect(
    useCallback(() => {
      loadSongs();
    }, []),
  );

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
          item.primary_artists?.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredSongs(results);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredSongs(songs);
  };

  return (
    <View style={{ flex: 1 }}>
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
            data={filteredSongs}
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
