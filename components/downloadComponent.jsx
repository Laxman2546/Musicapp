import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useEffect, useState } from "react";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import defaultMusicImage from "@/assets/images/musicImage.png";
import musicPlay from "@/assets/images/playing.gif";
import { EllipsisVerticalIcon, Trash2 } from "lucide-react-native";

const downloadsDir = `${FileSystem.documentDirectory}downloads/`;

const DownloadComponent = ({
  type,
  song,
  image,
  music,
  duration,
  primary_artists,
  song_url,
  index,
  onDelete,
  allSongs = [],
}) => {
  const { playSong, currentSong, isPlaying } = usePlayer();
  const [showMore, setShowmore] = useState(false);

  const gotoPlayer = () => {
    if (currentSong == isPlaying) router.push("/player");
  };

  const handleSong = () => {
    const formattedList = allSongs
      .map((item) => ({
        id: item.id,
        song: item.song || item.name,
        name: item.song || item.name,
        image:
          Array.isArray(item.image) && item.image[2]?.url
            ? item.image[2].url
            : item.image,
        music:
          item.music ||
          item.downloadUrl?.[4]?.url ||
          item.downloadUrl?.[3]?.url ||
          "",
        duration: item.duration,
        primary_artists:
          item.primary_artists ||
          item.artist ||
          (item.artists?.primary
            ? item.artists.primary.map((a) => a.name)
            : "Unknown"),
        song_url:
          item.media_url ||
          item.music ||
          item.filePath ||
          item.downloadUrl?.[4]?.url ||
          item.downloadUrl?.[3]?.url ||
          "",
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

  const convertDuration = (duration) => {
    if (!duration) return "00:00";
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };

  const handleDelete = async () => {
    try {
      // Get the file ID from the song_url path
      const fileId = song_url.split("/").pop().split(".")[0];

      // Delete the MP3 file
      await FileSystem.deleteAsync(song_url);

      // Delete the JSON metadata file
      try {
        const jsonFile = `${downloadsDir}${fileId}.json`;
        await FileSystem.deleteAsync(jsonFile);
      } catch (error) {
        console.log("Error deleting JSON file:", error);
      }

      // Delete any associated image files
      try {
        const files = await FileSystem.readDirectoryAsync(downloadsDir);
        const imageFiles = files.filter((file) =>
          file.startsWith(`${fileId}_artwork`),
        );
        for (const imageFile of imageFiles) {
          await FileSystem.deleteAsync(`${downloadsDir}${imageFile}`);
        }
      } catch (error) {
        console.log("Error deleting image files:", error);
      }

      onDelete();
    } catch (error) {
      console.log("Error deleting file:", error);
    }
  };

  // Display the clean song name, not the ID
  const songName = song ? song.split(`(`)[0].trim() : "Unknown Song";

  const getImageSource = (image) => {
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

  return (
    <Pressable
      onPress={() => {
        setShowmore(false);
      }}
    >
      <View
        className={`w-full flex flex-row gap-6 ${
          currentSong?.song === song ? `bg-gray-300` : `bg-gray-100`
        }  rounded-2xl p-3 mb-2`}
      >
        <View>
          <Image
            source={getImageSource(image)}
            style={{ width: 60, height: 60, borderRadius: 10 }}
          />
        </View>
        {currentSong?.song === song && isPlaying && (
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
        <View className="flex flex-row justify-between align-middle w-3/4 relative">
          <TouchableOpacity onPress={handleSong}>
            <View>
              <View className="SongName pr-7">
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "Nunito-Bold" }}
                  className="text-lg"
                >
                  {songName}
                </Text>
              </View>

              <View className="pr-16">
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: "Poppins-Regular" }}
                >
                  {String(music || primary_artists || "...")}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View className="flex gap-3 absolute right-1 items-center">
            <Pressable onPress={() => setShowmore(!showMore)}>
              <EllipsisVerticalIcon color="#333" />
            </Pressable>
            <Text style={{ fontFamily: "Poppins-Regular" }}>
              {convertDuration(duration)}
            </Text>
          </View>

          {showMore && (
            <Pressable onPress={handleDelete}>
              <View className="absolute right-6 bg-red-700 p-3 top-6 rounded-xl z-50 flex flex-row gap-3">
                <Text
                  style={{ fontFamily: "Nunito-Regular" }}
                  className="text-white"
                >
                  Delete song
                </Text>
                <Trash2 size={20} color={"#fff"} />
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default memo(DownloadComponent);
