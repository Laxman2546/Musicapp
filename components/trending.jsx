import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import React, { useEffect, useState, memo } from "react";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import downloadIcon from "@/assets/images/downloadSong.png";
import checkedIcon from "@/assets/images/checked.png";
import defaultMusicImage from "@/assets/images/musicImage.png";
import musicPlay from "@/assets/images/playing.gif";

const downloadsDir = `${FileSystem.documentDirectory}downloads/`;

// Ensure directory exists
const ensureDirExists = async () => {
  const dir = await FileSystem.getInfoAsync(downloadsDir);
  if (!dir.exists) {
    await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
  }
};

// Clean song name for display
const cleanSongName = (name) => {
  if (!name) return "Unknown";
  return String(name).replace(/_/g, " ").replace(/\s+/g, " ").trim();
};

// Sanitize filename to remove illegal characters
const sanitizeFilename = (filename) => {
  if (!filename) return "unknown";
  return String(filename)
    .replace(/[^a-z0-9\-_ ]/gi, "") // Remove special characters except spaces, hyphens, and underscores
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim() // Trim whitespace
    .replace(/\s/g, "_"); // Replace remaining spaces with underscores
};

const Trending = ({
  song,
  image,
  music,
  duration,
  primary_artists,
  song_url,
  index,
  allSongs,
  isdownloadedSongs,
  id, // Accept song ID if provided
}) => {
  const { playSong, currentSong, isPlaying, isSameSong, generateUniqueId } =
    usePlayer();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  // Generate unique ID for this song if not provided
  const songId = id || generateUniqueId(song, primary_artists, duration);

  // Clean the song name for display
  const displaySongName = cleanSongName(song);

  const convertDuration = (duration) => {
    if (!duration) return "00:00";
    const min = Math.floor(duration / 60);
    const sec = Math.floor(duration % 60);
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  // Fix for the Trending.js component - Improved image handling

  const imageSource = (image) => {
    // If no image provided, return default
    if (!image) return defaultMusicImage;

    // Handle string URLs
    if (typeof image === "string") {
      if (
        image.startsWith("http") ||
        image.startsWith("https") ||
        image.startsWith("content://") ||
        image.startsWith("file://")
      ) {
        return { uri: image };
      }
    }

    // Handle image array from search API
    if (Array.isArray(image)) {
      // Try to get highest quality image (usually at index 2)
      if (image[2] && image[2].url) {
        return { uri: image[2].url };
      }
      // Fallback to any available image
      for (let i = 0; i < image.length; i++) {
        if (image[i] && image[i].url) {
          return { uri: image[i].url };
        }
      }
    }

    // Default fallback
    return defaultMusicImage;
  };

  const handlePlay = () => {
    // Create a consistent song object with properly handled image
    let imageUrl = null;

    // Handle string image URLs
    if (
      typeof image === "string" &&
      (image.startsWith("http") ||
        image.startsWith("https") ||
        image.startsWith("content://") ||
        image.startsWith("file://"))
    ) {
      imageUrl = image;
    }
    // Handle image array from search API
    else if (Array.isArray(image)) {
      if (image[2] && image[2].url) {
        imageUrl = image[2].url;
      } else {
        // Find first valid image URL
        for (let i = 0; i < image.length; i++) {
          if (image[i] && image[i].url) {
            imageUrl = image[i].url;
            break;
          }
        }
      }
    }

    const songWithId = {
      id: songId,
      song: displaySongName,
      name: displaySongName,
      image: imageUrl || image,
      music: music,
      duration: duration,
      primary_artists: primary_artists,
      artist: primary_artists,
      song_url: song_url,
    };

    // Play the song with its unique ID
    playSong(songWithId, allSongs, index);
    router.push("/player");
  };

  const checkIfAlreadyDownloaded = async () => {
    await ensureDirExists();

    try {
      const files = await FileSystem.readDirectoryAsync(downloadsDir);

      // Look for JSON metadata file with this song's unique ID
      const metadataExists = files.some(
        (file) => file === `${songId}.json` || file.startsWith(`${songId}_`)
      );

      setIsDownloaded(metadataExists);
    } catch (error) {
      console.error("Error checking downloaded status:", error);
      setIsDownloaded(false);
    }
  };

  useEffect(() => {
    checkIfAlreadyDownloaded();
  }, [songId]);

  const handleDownload = async () => {
    if (isDownloaded || !song_url) return;
    if (isDownloading) {
      Alert.alert("Please wait", "One song is already downloading...");
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      await ensureDirExists();

      if (permissionResponse?.status !== "granted") {
        const { status } = await requestPermission();
        if (status !== "granted") {
          Alert.alert(
            "Permission required",
            "Storage permission is needed to download songs"
          );
          return;
        }
      }

      // Use the unique song ID for filenames
      const filename = `${songId}.mp3`;
      const filePath = `${downloadsDir}${filename}`;

      // Download the image if it's from a URL
      let localImagePath = null;
      if (image && typeof image === "string" && image.startsWith("http")) {
        const imageExt = image.split(".").pop().split("?")[0] || "jpg";
        const imageFilename = `${songId}_artwork.${imageExt}`;
        const imageFilePath = `${downloadsDir}${imageFilename}`;

        try {
          const imageDownload = await FileSystem.downloadAsync(
            image,
            imageFilePath
          );
          if (imageDownload.status === 200) {
            localImagePath = imageDownload.uri;
          }
        } catch (error) {
          console.log("Error downloading image:", error);
        }
      }

      const downloadResumable = FileSystem.createDownloadResumable(
        song_url,
        filePath,
        {},
        (progress) => {
          if (progress.totalBytesExpectedToWrite > 0) {
            const percent =
              progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
            setDownloadProgress(percent);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error("Download failed");
      if (Platform.OS === "android") {
        await MediaLibrary.createAssetAsync(result.uri);
      }

      const metadata = {
        id: songId,
        song: displaySongName,
        name: displaySongName,
        artist: primary_artists,
        duration,
        image: localImagePath || image,
        music: primary_artists || music,
        filePath: result.uri,
        downloadedAt: new Date().toISOString(),
      };

      const metaFile = `${downloadsDir}${songId}.json`;
      await FileSystem.writeAsStringAsync(metaFile, JSON.stringify(metadata));

      setIsDownloaded(true);
    } catch (err) {
      console.log("Download Error:", err.message);
      Alert.alert(
        "Download Failed",
        "Could not download song. Please try again.",
        err.message
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Check if this song is currently playing using our helper function
  const isCurrentlyPlaying = () => {
    if (!currentSong) return false;

    const thisSong = {
      song: song,
      title: song,
      primary_artists: primary_artists,
      artist: primary_artists,
    };

    return isSameSong(currentSong, thisSong);
  };

  return (
    <>
      {song ? (
        <View
          className={`w-full flex flex-row gap-6 ${
            isCurrentlyPlaying() ? `bg-gray-300` : `bg-gray-100`
          } rounded-2xl p-4 mb-2`}
        >
          <Image
            source={imageSource(image)}
            style={{ width: 60, height: 60, borderRadius: 10 }}
          />
          {isCurrentlyPlaying() && isPlaying && (
            <Image
              source={musicPlay}
              style={{
                width: 50,
                height: 50,
                position: "absolute",
                top: 15,
                left: 20,
              }}
            />
          )}
          <View className="flex-1 justify-between">
            <TouchableOpacity onPress={handlePlay}>
              <Text
                numberOfLines={1}
                className="text-lg font-bold"
                style={{
                  fontFamily: "Nunito-Bold",
                }}
              >
                {displaySongName}
              </Text>
              <Text
                numberOfLines={1}
                className="text-sm text-gray-600"
                style={{
                  fontFamily: "Poppins-Regular",
                }}
              >
                {primary_artists || music}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex items-center gap-2">
            <TouchableOpacity onPress={handleDownload} disabled={isDownloaded}>
              {isDownloading ? (
                <View className="items-center">
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={{ fontSize: 10 }}>
                    {Math.round(downloadProgress * 100)}%
                  </Text>
                </View>
              ) : (
                <Image
                  source={
                    isDownloaded || isdownloadedSongs
                      ? checkedIcon
                      : downloadIcon
                  }
                  style={{ width: 24, height: 24 }}
                />
              )}
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  fontFamily: "Poppins-Regular",
                }}
              >
                {convertDuration(duration)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="w-full h-full flex justify-center items-center pb-10">
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              fontSize: 18,
            }}
          >
            No songs Found 😕
          </Text>
        </View>
      )}
    </>
  );
};

export default memo(Trending);
