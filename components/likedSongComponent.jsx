import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useEffect, useState } from "react";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import moreIcon from "@/assets/images/more.png";
import trash from "@/assets/images/removeHeart.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultMusicImage from "@/assets/images/musicImage.png";

const likedSongComponent = ({
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
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    const checkIfEmpty = async () => {
      try {
        const data = await AsyncStorage.getItem("favouriteSongs");
        const songs = data ? JSON.parse(data) : [];
        setIsEmpty(songs.length === 0);
      } catch (error) {
        console.error("Error checking downloads:", error);
        setIsEmpty(true);
      }
    };
    checkIfEmpty();
  }, []);
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
      song_url: song_url || "",
    };

    const formattedAllSongs = allSongs
      .map((song, i) => ({
        song: song.song,
        image: song.image,
        music: song.music,
        duration: song.duration,
        primary_artists: song.primary_artists,
        song_url:
          song.media_url || song.music || song.filePath || song.song_url || "",
      }))
      .filter((song) => song.song_url); // Filter out songs with no URL

    if (formattedAllSongs.length === 0) {
      console.error("No valid songs to play");
      return;
    }

    // Find the correct index in the filtered list
    const newIndex = formattedAllSongs.findIndex(
      (s) =>
        s.song === songObject.song &&
        s.primary_artists === songObject.primary_artists
    );

    if (newIndex === -1) {
      console.error("Could not find song in playlist");
      return;
    }

    playSong(songObject, formattedAllSongs, newIndex);
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
      const data = await AsyncStorage.getItem("favouriteSongs");
      let songs = data ? JSON.parse(data) : [];
      songs = songs.filter(
        (s) => !(s.song === song && s.primary_artists === primary_artists)
      );
      await AsyncStorage.setItem("favouriteSongs", JSON.stringify(songs));
      if (songs.length === 0) {
        setIsEmpty(true);
      }
      if (onDelete) onDelete();
      setShowmore(false);
    } catch (error) {
      console.error("Error Removing song:", error);
    }
  };

  const songName = song ? song.split(`(`)[0] : "Unknown Song";

  const imageSource = (image) => {
    if (typeof image == "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
  };

  if (isEmpty) {
    return (
      <View className="w-full h-full flex justify-center items-center pb-10">
        <Text style={{ fontFamily: "Nunito-Bold", fontSize: 18 }}>
          No Favourite songs found 😕
        </Text>
      </View>
    );
  }

  return (
    <>
      {allSongs.length === 0 || !song ? (
        <View className="w-full h-full flex justify-center items-center pb-10">
          <Text style={{ fontFamily: "Nunito-Bold", fontSize: 18 }}>
            No Favourite songs found 😕
          </Text>
        </View>
      ) : (
        <Pressable
          onPress={() => {
            setShowmore(false);
            gotoPlayer;
          }}
        >
          <View className="w-full flex flex-row gap-6 bg-gray-200 rounded-2xl  p-2 mb-2">
            <View>
              <Image
                source={imageSource(image)}
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
                      {String(music || primary_artists || "Nanimusic")}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View className="flex gap-3 absolute right-1 top-1 items-center">
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
                      Remove favorite
                    </Text>
                    <Image source={trash} style={{ width: 20, height: 20 }} />
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>
      )}
    </>
  );
};

export default memo(likedSongComponent);
