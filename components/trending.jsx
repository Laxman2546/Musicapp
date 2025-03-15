import { Image, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import DownloadSong from "@/assets/images/downloadSong.png";
import Marquee from "react-native-marquee";
const Trending = ({ type, song, image, music, duration, primary_artists }) => {
  const handleDownload = () => {
    console.log(`Downloading song: ${song}`);
  };

  const convertDuration = (duration) => {
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = Math.floor(duration % 60);

    const min = String(minutes).padStart(2, "0");
    const sec = String(seconds).padStart(2, "0");

    return `${min}:${sec}`;
  };

  return (
    <>
      {type == "Trending" ? (
        <View className="w-full flex flex-row gap-6 bg-gray-100 rounded-2xl p-3 mb-2">
          <View>
            <Image
              source={{ uri: image }}
              style={{
                width: 60,
                height: 60,
                borderRadius: 10,
              }}
            />
          </View>
          <View className="flex flex-row justify-between align-middle w-3/4 relative">
            <View>
              <View className="SongName pr-7">
                <Text
                  numberOfLines={1}
                  style={{
                    fontFamily: "Nunito-Bold",
                  }}
                  className="text-lg"
                >
                  {song}
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
            <View className="flex gap-1 absolute right-2 items-center">
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
      ) : null}
    </>
  );
};

export default Trending;
