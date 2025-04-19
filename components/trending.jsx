import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
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

// Sanitize filename to remove illegal characters
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9\-_ ]/gi, "") // Remove special characters except spaces, hyphens, and underscores
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim() // Trim whitespace
    .replace(/\s/g, "_"); // Replace remaining spaces with underscores
};

// Clean song name for display
const cleanSongName = (name) => {
  return name.replace(/_/g, " ").replace(/\s+/g, " ").trim();
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
}) => {
  const { playSong, currentIndex, currentSong, isPlaying } = usePlayer();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const convertDuration = (duration) => {
    if (!duration) return "00:00";
    const min = Math.floor(duration / 60);
    const sec = Math.floor(duration % 60);
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const imageSource = (image) => {
    if (typeof image == "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
  };

  const handlePlay = () => {
    const formattedList = allSongs
      .map((item) => ({
        song: cleanSongName(item.song),
        image: item.image,
        music: item.music,
        duration: item.duration,
        primary_artists: item.primary_artists,
        song_url: item.media_url || item.music || item.filePath || "",
      }))
      .filter((song) => song.song_url);

    if (formattedList.length === 0) {
      console.error("No valid songs to play");
      return;
    }

    const songObject = formattedList[index];
    if (!songObject) {
      console.error("Invalid song index");
      return;
    }

    playSong(songObject, formattedList, index);
    router.push("/player");
  };

  const checkIfAlreadyDownloaded = async () => {
    await ensureDirExists();
    const files = await FileSystem.readDirectoryAsync(downloadsDir);
    const sanitizedSongName = sanitizeFilename(song);
    const exists = files.some((file) => file.includes(sanitizedSongName));
    setIsDownloaded(exists);
  };

  useEffect(() => {
    checkIfAlreadyDownloaded();
  }, []);

  const handleDownload = async () => {
    if (isDownloaded || !song_url) return;
    if (isDownloading) {
      Alert.alert("wait a sec one song is already downloading...😊");
    }
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      await ensureDirExists();

      if (permissionResponse?.status !== "granted") {
        const { status } = await requestPermission();
        if (status !== "granted") {
          return;
        }
      }
      const sanitizedSongName = sanitizeFilename(song);
      const filename = `${sanitizedSongName}.mp3`;
      const filePath = `${downloadsDir}${filename}`;

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

      // Save to Media Library (Android)
      if (Platform.OS === "android") {
        await MediaLibrary.createAssetAsync(result.uri);
      }
      const metadata = {
        song: cleanSongName(song),
        artist: primary_artists,
        duration,
        image,
        music,
        filePath: result.uri,
        downloadedAt: new Date().toISOString(),
      };

      const metaFile = `${downloadsDir}${sanitizedSongName}.json`;
      await FileSystem.writeAsStringAsync(metaFile, JSON.stringify(metadata));

      setIsDownloaded(true);
    } catch (err) {
      console.log("Download Error:", err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {song ? (
        <View
          className={`w-full flex flex-row gap-6 ${
            currentSong?.song === cleanSongName(song)
              ? `bg-gray-300`
              : `bg-gray-100`
          } rounded-2xl p-4 mb-2`}
        >
          <Image
            source={imageSource(image)}
            style={{ width: 60, height: 60, borderRadius: 10 }}
          />
          {currentSong?.song === cleanSongName(song) && isPlaying && (
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
                {cleanSongName(song)}
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
