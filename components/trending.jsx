import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import DownloadSong from "@/assets/images/downloadSong.png";
import Marquee from "react-native-marquee";
import { memo } from "react";
import { Link, useNavigation, router } from "expo-router";
import { usePlayer } from "@/context/playerContext";
const Trending = ({
  type,
  song,
  image,
  music,
  duration,
  primary_artists,
  song_url,
  allSongs,
  index,
}) => {
  const navigation = useNavigation();
  const { playSong } = usePlayer();

  const handleSong = () => {
    playSong(
      { song, image, music, duration, primary_artists },
      allSongs,
      index
    );
    router.push("/player");
  };

  const handleDownload = () => {
    console.log(`Downloading song: ${song}`);
  };

  const convertDuration = (duration) => {
    if (!duration) return "00:00";

    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const min = String(minutes).padStart(2, "0");
    const sec = String(seconds).padStart(2, "0");

    return `${min}:${sec}`;
  };
  const songName = song.split(`(`);
  return (
    <>
      <View className="w-full flex flex-row gap-6 bg-gray-100 rounded-2xl p-3 mb-2">
        <View>
          <Image
            source={{ uri: image }}
            defaultSource={{
              uri: "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png",
            }}
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
                    {music || primary_artists}
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
    </>
  );
};

export default memo(Trending);
