import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import backIcon from "@/assets/images/backImg.png";
import { router } from "expo-router";
import Trending from "@/components/trending";
const localFiles = () => {
  const [songs, setSongs] = useState([]);
  const handleBack = () => {
    router.back();
  };
  const getSongs = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === "granted") {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: 100000,
      });

      const songDetails = await Promise.all(
        media.assets.map(async (song) => {
          const songInfo = await MediaLibrary.getAssetInfoAsync(song.id);
          return {
            id: song.id,
            song: songInfo.filename.replace(/\.[^/.]+$/, ""),
            music: song.uri,
            duration: songInfo.duration,
            image: songInfo.album?.uri,
          };
        })
      );
      const sortedSongs = songDetails.sort((a, b) =>
        a.song.localeCompare(b.song)
      );
      setSongs(sortedSongs);
    }
  };
  useEffect(() => {
    getSongs();
  }, []);

  return (
    <>
      <View className="p-5">
        <View className="flex flex-row gap-3 items-center">
          <Pressable onPress={handleBack}>
            <View className="p-3 rounded-full bg-[#222]">
              <Image source={backIcon} style={styles.backImg} />
            </View>
          </Pressable>
          <Text style={styles.textStyle}>LocalSongs</Text>
        </View>
        {songs.length < 1 ? (
          <>
            <View className="w-full h-screen flex items-center justify-center">
              <Text style={styles.textFont}>No Local songs found 😐</Text>
              <Text style={styles.textFont}>Check the premissions</Text>
            </View>
          </>
        ) : (
          <>
            <View>
              <FlatList
                data={songs || []}
                className="mb-20"
                renderItem={({ item, index }) => (
                  <>
                    <Trending
                      song={item.song}
                      image={item.image}
                      music={"Nanimusic..."}
                      duration={item.duration}
                      primary_artists={"Nanimusic..."}
                      song_url={item.music}
                      index={index}
                      allSongs={songs || []}
                    />
                  </>
                )}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default localFiles;

const styles = StyleSheet.create({
  backImg: {
    width: 15,
    height: 15,
    borderRadius: 25,
  },
  textStyle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
  },
  textFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#333",
  },
});
