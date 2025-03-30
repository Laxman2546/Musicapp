import { Image, Text, TouchableOpacity, View } from "react-native";
import React, { memo } from "react";
import DownloadSong from "@/assets/images/downloadSong.png";
import Marquee from "react-native-marquee";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
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
}) => {
  const { playSong } = usePlayer();

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
          song_url: song.media_url || song.music,
        }))
      : [songObject];

    playSong(songObject, formattedAllSongs, index);
    router.push("/player");
  };

  const handleDownload = async () => {
    try {
      const downloadDest = `${FileSystem.documentDirectory}${song}.mp3`;

      const download = FileSystem.createDownloadResumable(
        song_url,
        downloadDest,
        {},
        (progress) => {
          console.log(
            `Downloaded: ${
              (progress.totalBytesWritten /
                progress.totalBytesExpectedToWrite) *
              100
            }%`
          );
        }
      );

      const result = await download.downloadAsync();

      if (result) {
        const songData = {
          song,
          image,
          duration,
          primary_artists,
          filePath: result.uri,
        };
        const existingSongs = await AsyncStorage.getItem("downloadedSongs");
        let songsArray = existingSongs ? JSON.parse(existingSongs) : [];
        songsArray.push(songData);
        await AsyncStorage.setItem(
          "downloadedSongs",
          JSON.stringify(songsArray)
        );
        console.log(`Song ${song} added to downloads`);
      }
    } catch (e) {
      console.log("Download failed:", e);
    }
  };
  const getItems = async () => {
    try {
      const data = await AsyncStorage.getItem("downloadedSongs");
      return data != null ? JSON.parse(data) : null;
    } catch (error) {
      console.log("Error getting items:", error);
      return null;
    }
  };
  console.log(getItems());

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
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
  };

  return (
    <>
      {song ? (
        <View className="w-full flex flex-row gap-6 bg-gray-100 rounded-2xl p-3 mb-2">
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
            <TouchableOpacity onPress={handleSong}>
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
                  <Marquee>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: "Poppins-Regular",
                      }}
                    >
                      {String(music || primary_artists || "...")}
                    </Text>
                  </Marquee>
                </View>
              </View>
            </TouchableOpacity>
            <View className="flex gap-1 absolute right-2 items-center z-40">
              <TouchableOpacity onPress={handleDownload}>
                <Image
                  source={DownloadSong}
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
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
        // No Songs Found Message
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
