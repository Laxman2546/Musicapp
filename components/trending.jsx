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
import he from "he";
import { getDownloadsDirectory, ensureDirExists } from "@/utils/storage";

const getDownloadsDirAsync = async () => {
  try {
    return await getDownloadsDirectory();
  } catch (error) {
    console.error("Error getting downloads directory:", error);
    throw error;
  }
};

const cleanSongName = (name) => {
  if (!name) return "Unknown";

  const decodedName = he.decode(name);
  const songName = decodedName.replace(/_/g, " ").replace(/\s+/g, " ").trim();
  return songName;
};

const sanitizeFilename = (filename) => {
  if (!filename) return "unknown";
  return String(filename)
    .replace(/[^a-z0-9\-_ ]/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "_");
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
  id,
}) => {
  const { playSong, currentSong, isPlaying, isSameSong, generateUniqueId } =
    usePlayer();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const songId = id || generateUniqueId(song, primary_artists, duration);

  const displaySongName = cleanSongName(song);

  const convertDuration = (duration) => {
    if (!duration) return "00:00";
    const min = Math.floor(duration / 60);
    const sec = Math.floor(duration % 60);
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const imageSource = (image) => {
    if (!image) return defaultMusicImage;

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

    if (Array.isArray(image)) {
      if (image[2] && image[2].url) {
        return { uri: image[2].url };
      }
      for (let i = 0; i < image.length; i++) {
        if (image[i] && image[i].url) {
          return { uri: image[i].url };
        }
      }
    }

    return defaultMusicImage;
  };

  const handlePlay = () => {
    let imageUrl = null;

    if (
      typeof image === "string" &&
      (image.startsWith("http") ||
        image.startsWith("https") ||
        image.startsWith("content://") ||
        image.startsWith("file://"))
    ) {
      imageUrl = image;
    } else if (Array.isArray(image)) {
      if (image[2] && image[2].url) {
        imageUrl = image[2].url;
      } else {
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
      song: cleanSongName(displaySongName),
      name: cleanSongName(displaySongName),
      image: imageUrl || image,
      music: music,
      duration: duration,
      primary_artists: primary_artists,
      artist: primary_artists,
      song_url: song_url,
    };

    playSong(songWithId, allSongs, index);
    router.push("/player");
  };

  const checkIfAlreadyDownloaded = async () => {
    try {
      const dir = await getDownloadsDirAsync();
      const files = await FileSystem.readDirectoryAsync(dir);

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

      const downloadsPath = await getDownloadsDirAsync();
      const filename = `${songId}.mp3`;
      const filePath = `${downloadsPath}${filename}`;

      let localImagePath = null;
      if (image && typeof image === "string" && image.startsWith("http")) {
        const imageExt = image.split(".").pop().split("?")[0] || "jpg";
        const imageFilename = `${songId}_artwork.${imageExt}`;

        try {
          // Download image to temp location first
          const tempImagePath = `${FileSystem.cacheDirectory}${imageFilename}`;
          const imageDownload = await FileSystem.downloadAsync(
            image,
            tempImagePath
          );

          if (imageDownload.status === 200) {
            if (
              Platform.OS === "android" &&
              downloadsPath.startsWith("content://")
            ) {
              // For Android, use SAF to store the image
              const imageContent = await FileSystem.readAsStringAsync(
                tempImagePath,
                {
                  encoding: "base64",
                }
              );
              const imageUri =
                await FileSystem.StorageAccessFramework.createFileAsync(
                  downloadsPath,
                  imageFilename,
                  "image/jpeg"
                );
              await FileSystem.StorageAccessFramework.writeAsStringAsync(
                imageUri,
                imageContent,
                { encoding: "base64" }
              );
              localImagePath = imageUri;
            } else {
              // For iOS, move to downloads directory
              const finalImagePath = `${downloadsPath}${imageFilename}`;
              await FileSystem.moveAsync({
                from: tempImagePath,
                to: finalImagePath,
              });
              localImagePath = finalImagePath;
            }
          }
          // Clean up temp file if it exists
          if (await FileSystem.getInfoAsync(tempImagePath).exists) {
            await FileSystem.deleteAsync(tempImagePath);
          }
        } catch (error) {
          console.log("Error handling image:", error);
        }
      }

      // Handle download based on platform
      let result;
      if (Platform.OS === "android" && downloadsPath.startsWith("content://")) {
        // For Android using Storage Access Framework
        const tempFile = FileSystem.cacheDirectory + filename;
        const downloadResumable = FileSystem.createDownloadResumable(
          song_url,
          tempFile,
          {},
          (progress) => {
            if (progress.totalBytesExpectedToWrite > 0) {
              const percent =
                progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
              setDownloadProgress(percent);
            }
          }
        );

        const tempResult = await downloadResumable.downloadAsync();
        if (!tempResult?.uri) throw new Error("Download failed");

        // Create file in SAF directory
        const fileContent = await FileSystem.readAsStringAsync(tempResult.uri, {
          encoding: "base64",
        });
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          downloadsPath,
          filename,
          "audio/mpeg"
        );
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          newUri,
          fileContent,
          { encoding: "base64" }
        );
        result = { uri: newUri };

        // Clean up temp file
        await FileSystem.deleteAsync(tempResult.uri);
      } else {
        // For iOS or fallback storage
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

        result = await downloadResumable.downloadAsync();
        if (!result?.uri) throw new Error("Download failed");
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

      // Save metadata based on platform
      if (Platform.OS === "android" && downloadsPath.startsWith("content://")) {
        const metadataUri =
          await FileSystem.StorageAccessFramework.createFileAsync(
            downloadsPath,
            `${songId}.json`,
            "application/json"
          );
        await FileSystem.StorageAccessFramework.writeAsStringAsync(
          metadataUri,
          JSON.stringify(metadata)
        );
      } else {
        const metaFile = `${downloadsPath}${songId}.json`;
        await FileSystem.writeAsStringAsync(metaFile, JSON.stringify(metadata));
      }

      setIsDownloaded(true);
    } catch (err) {
      console.log("Download Error:", err.message);
      // Clean up any partial downloads
      try {
        if (localImagePath) {
          if (
            Platform.OS === "android" &&
            localImagePath.startsWith("content://")
          ) {
            await FileSystem.StorageAccessFramework.deleteAsync(localImagePath);
          } else {
            await FileSystem.deleteAsync(localImagePath);
          }
        }

        // Clean up the MP3 file if it exists
        if (result?.uri) {
          if (
            Platform.OS === "android" &&
            result.uri.startsWith("content://")
          ) {
            await FileSystem.StorageAccessFramework.deleteAsync(result.uri);
          } else {
            await FileSystem.deleteAsync(result.uri);
          }
        }
      } catch (cleanupError) {
        console.log("Error cleaning up failed download:", cleanupError);
      }

      Alert.alert(
        "Download Failed",
        "Could not download song. Please try again."
      );
    } finally {
      setIsDownloading(false);
    }
  };

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
