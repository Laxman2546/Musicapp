import { Image, Text, TouchableOpacity, View } from "react-native";
import React, { memo, useEffect, useState } from "react";
import DownloadSong from "@/assets/images/downloadSong.png";
import Marquee from "react-native-marquee";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import Svg, { Circle } from "react-native-svg";
import checked from "@/assets/images/checked.png";

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
    if (downloadedSongs || isdownloadedSongs) {
      return;
    }
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const existingSongs = await AsyncStorage.getItem("downloadedSongs");
      let songsArray = existingSongs ? JSON.parse(existingSongs) : [];

      if (
        songsArray.some(
          (s) => s.song === song && s.primary_artists === primary_artists
        )
      ) {
        console.log("Song already downloaded");
        setDownloadedSongs(true);
        setIsDownloading(false);
        return;
      }

      const sanitizeFileName = (name) =>
        name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const fileExt = song_url.split(".").pop() || "mp3";
      const fileName = `${sanitizeFileName(song)}.${fileExt}`;
      const downloadDest = `${FileSystem.documentDirectory}${fileName}`;

      const download = FileSystem.createDownloadResumable(
        song_url,
        downloadDest,
        {},
        (progress) => {
          const percent =
            progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          setDownloadProgress(percent);
        }
      );

      const result = await download.downloadAsync();

      if (result && result.status === 200) {
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
      } else {
        throw new Error("Download failed - no result or bad status");
      }
    } catch (e) {
      console.error("Download failed:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const getSongs = async () => {
    try {
      const data = await AsyncStorage.getItem("downloadedSongs");
      let songDets = data ? JSON.parse(data) : [];
      if (
        songDets.some(
          (s) => s.song === song && s.primary_artists === primary_artists
        )
      ) {
        setDownloadedSongs(true);
        setIsDownloading(false);
        return;
      }
    } catch (e) {
      console.log(e);
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
    if (typeof image === "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
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
              <TouchableOpacity
                onPress={handleDownload}
                disabled={isDownloading}
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
