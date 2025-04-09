import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import React, { memo, useEffect, useState } from "react";
import DownloadSong from "@/assets/images/downloadSong.png";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import Svg, { Circle } from "react-native-svg";
import checked from "@/assets/images/checked.png";
import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";

const Trending = ({
  type,
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
  const { playSong } = usePlayer();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedSongs, setDownloadedSongs] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const radius = 12;
  const strokeWidth = 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - downloadProgress);

  const handleSong = () => {
    const songObject = {
      song,
      image,
      music,
      duration,
      primary_artists,
      song_url,
    };

    const formattedAllSongs = Array.isArray(allSongs)
      ? allSongs.map((song, i) => ({
          song: song.song,
          image: song.image,
          music: song.music,
          duration: song.duration,
          primary_artists: song.primary_artists,
          song_url: song.media_url || song.music || song.filePath,
        }))
      : [songObject];

    playSong(songObject, formattedAllSongs, index);
    router.push("/player");
  };
  const handleDownload = async () => {
    // Skip if already downloaded
    if (downloadedSongs || isdownloadedSongs) {
      return;
    }

    let downloadDest = null;

    try {
      // Check permissions - simplified and separate from the download logic
      if (permissionResponse?.status !== "granted") {
        try {
          const { status } = await requestPermission();
          if (status !== "granted") {
            Alert.alert(
              "Permission Required",
              "Storage permission is needed to download songs."
            );
            return;
          }
        } catch (permError) {
          const errorMsg = `Permission error: ${
            permError.message || "Unknown"
          }`;
          console.log(errorMsg);
          Alert.alert("Permission Error", errorMsg);
          return;
        }
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      // Check if song already exists in storage
      let songsArray = [];
      try {
        const existingSongs = await AsyncStorage.getItem("downloadedSongs");
        songsArray = existingSongs ? JSON.parse(existingSongs) : [];

        // Validate data structure
        if (!Array.isArray(songsArray)) {
          const errorMsg = "Songs data is not an array: " + typeof songsArray;
          console.log(errorMsg);
          Alert.alert("Data Error", errorMsg);
          songsArray = [];
          await AsyncStorage.setItem("downloadedSongs", JSON.stringify([]));
        }
      } catch (storageError) {
        const errorMsg = `Storage error: ${storageError.message || "Unknown"}`;
        console.log(errorMsg);
        Alert.alert("Storage Error", errorMsg);
        songsArray = [];
        await AsyncStorage.setItem("downloadedSongs", JSON.stringify([]));
      }

      // Basic URL validation
      if (!song_url || typeof song_url !== "string") {
        const errorMsg = `Invalid URL: ${typeof song_url}`;
        console.log(errorMsg);
        Alert.alert("URL Error", errorMsg);
        throw new Error(errorMsg);
      }

      // Create a simple filename that's safe for all platforms
      const safeTitle = song
        ? song
            .substring(0, 20)
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()
        : "song";
      const uniqueId = Date.now().toString().slice(-6);
      const fileName = `${safeTitle}_${uniqueId}.mp3`;

      // Use a guaranteed safe directory that works across platforms
      downloadDest = `${FileSystem.cacheDirectory}${fileName}`;

      // Log the download path for debugging
      console.log("Download path:", downloadDest);
      Alert.alert(
        "Download Path",
        `Attempting to download to: ${downloadDest}`
      );

      // Create and start the download
      const downloadResumable = FileSystem.createDownloadResumable(
        song_url,
        downloadDest,
        {},
        (progress) => {
          if (progress.totalBytesExpectedToWrite > 0) {
            const percent =
              progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
            setDownloadProgress(Math.min(percent, 0.99));
          }
        }
      );

      // Execute the download with a simple timeout
      try {
        const result = await Promise.race([
          downloadResumable.downloadAsync(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Download timeout")), 30000)
          ),
        ]);

        // Log the result for debugging
        console.log("Download result:", JSON.stringify(result));

        // Basic success validation
        if (!result || !result.uri) {
          const errorMsg = "Download failed - no result or uri";
          console.log(errorMsg);
          Alert.alert("Download Error", errorMsg);
          throw new Error(errorMsg);
        }

        // Save the downloaded song info
        const songData = {
          song,
          image,
          duration,
          primary_artists,
          filePath: result.uri,
          downloadDate: new Date().toISOString(),
        };

        songsArray.push(songData);
        await AsyncStorage.setItem(
          "downloadedSongs",
          JSON.stringify(songsArray)
        );
        setDownloadedSongs(true);
        setDownloadProgress(1);

        Alert.alert(
          "Success",
          `Song downloaded successfully to: ${result.uri}`
        );
      } catch (downloadError) {
        const errorMsg = `Download error: ${
          downloadError.message || "Unknown"
        }`;
        console.log(errorMsg);
        Alert.alert("Download Error", errorMsg);
        throw downloadError;
      }
    } catch (error) {
      const errorDetails = `Error: ${error.message || "Unknown"}\nStack: ${
        error.stack || "No stack trace"
      }`;
      console.log("Full error details:", errorDetails);
      Alert.alert("Download Failed", errorDetails);

      // Cleanup if needed
      if (downloadDest) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(downloadDest);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(downloadDest);
          }
        } catch (cleanupError) {
          console.log("Cleanup error:", cleanupError);
        }
      }
    } finally {
      setIsDownloading(false);
    }
  };
  const getSongs = async () => {
    try {
      const data = await AsyncStorage.getItem("downloadedSongs");
      if (!data) return;

      try {
        const songDets = JSON.parse(data);

        // Validate data is an array
        if (!Array.isArray(songDets)) {
          console.log("Invalid songs data format");
          return;
        }

        // Check if current song is downloaded
        if (
          songDets.some(
            (s) => s.song === song && s.primary_artists === primary_artists
          )
        ) {
          setDownloadedSongs(true);
        }
      } catch (parseError) {
        console.log("Parse error:", parseError);
      }
    } catch (error) {
      console.log("Error getting songs:", error);
    }
  };

  useEffect(() => {
    getSongs();
  }, []);

  const convertDuration = (duration) => {
    if (!duration) return "00:00";

    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const songName = song ? song.split(`(`)[0] : "Unknown Song";

  const getImageSource = (image) => {
    try {
      if (typeof image === "string" && image.startsWith("http")) {
        return { uri: image };
      }
      return require("../assets/images/musicImage.png");
    } catch (e) {
      return require("../assets/images/musicImage.png");
    }
  };

  return (
    <>
      {song ? (
        <View className="w-full flex flex-row gap-6 bg-gray-100 rounded-2xl p-4 mb-2">
          <View>
            <Image
              source={getImageSource(image)}
              defaultSource={require("../assets/images/musicImage.png")}
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
              }}
            />
          </View>

          <View className="flex flex-row justify-between align-middle w-3/4 relative">
            <TouchableOpacity onPress={handleSong} hitSlop={10}>
              <View>
                <View className="SongName pr-7">
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "Nunito-Bold",
                    }}
                    className="text-lg"
                  >
                    {songName}
                  </Text>
                </View>

                <View className="pr-16">
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "Poppins-Regular",
                    }}
                  >
                    {String(music || primary_artists || "...")}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <View className="flex gap-1 absolute right-2 items-center z-40">
              <TouchableOpacity
                onPress={handleDownload}
                disabled={isDownloading}
                hitSlop={10}
              >
                {isDownloading ? (
                  <Svg width={radius * 2} height={radius * 2}>
                    <Circle
                      stroke="#000"
                      fill="transparent"
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      cx={radius}
                      cy={radius}
                      r={radius - strokeWidth / 2}
                    />
                  </Svg>
                ) : (
                  <Image
                    source={
                      downloadedSongs || isdownloadedSongs
                        ? checked
                        : DownloadSong
                    }
                    style={{
                      width: 25,
                      height: 25,
                    }}
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
