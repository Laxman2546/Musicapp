import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useState } from "react";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import moreIcon from "@/assets/images/more.png";
import trash from "@/assets/images/trash.png";
import * as FileSystem from "expo-file-system";
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
    const songObject = {
      song,
      image,
      music,
      duration,
      primary_artists,
      song_url,
    };

    const formattedAllSongs = allSongs.map((song, i) => ({
      song: song.song,
      image: song.image,
      music: song.music,
      duration: song.duration,
      primary_artists: song.primary_artists,
      song_url: song.media_url || song.music || song.filePath,
    }));

    playSong(songObject, formattedAllSongs, index);
    router.push("/player");
  };

  const convertDuration = (duration) => {
    if (!duration) return "00:00";
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleDelete = async () => {
    try {
      // Try deleting the song file
      await FileSystem.deleteAsync(song_url);

      // Try deleting the associated JSON metadata file (if exists)
      const jsonFile = song_url.replace(".mp3", ".json");
      try {
        await FileSystem.deleteAsync(jsonFile);
      } catch (error) {
        // If the JSON file doesn't exist, it will throw an error, but it's fine
        console.log("No associated JSON file to delete");
      }

      // Reload the song list
      onDelete();
    } catch (error) {
      console.log("Error deleting file:", error);
    }
  };

  const songName = song ? song.split(`(`)[0] : "Unknown Song";

  const getImageSource = (image) => {
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
  };

  return (
    <Pressable
      onPress={() => {
        setShowmore(false);
        gotoPlayer();
      }}
    >
      <View className="w-full flex flex-row gap-6 bg-gray-100 rounded-2xl p-3 mb-2">
        <View>
          <Image
            source={getImageSource(image)}
            defaultSource={require("../assets/images/musicImage.png")}
            style={{ width: 60, height: 60, borderRadius: 10 }}
          />
        </View>

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
              <Image source={moreIcon} style={{ width: 20, height: 20 }} />
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
                <Image source={trash} style={{ width: 20, height: 20 }} />
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default memo(DownloadComponent);
