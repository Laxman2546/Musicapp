import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { goBack } from "expo-router/build/global-state/routing";
import backIcon from "@/assets/images/backImg.png";
import { router } from "expo-router";
import LikedSongComponent from "@/components/likedSongComponent";
const likedSongs = () => {
  const [song, setSong] = useState([]);
  const getLikedSongs = async () => {
    const favoSongs = await AsyncStorage.getItem("favouriteSongs");
    const songsList = favoSongs ? JSON.parse(favoSongs) : [];
    setSong(songsList);
  };
  useEffect(() => {
    getLikedSongs();
  }, []);
  const handleBack = () => {
    router.push(goBack);
  };

  return (
    <>
      <View className="p-5">
        <View className="flex flex-row gap-3 items-center">
          <Pressable onPress={handleBack}>
            <View className="p-3 rounded-full bg-[#222]">
              <Image source={backIcon} style={styles.backImg} />
            </View>
          </Pressable>
          <Text style={styles.textStyle}>Liked songs</Text>
        </View>
        <View>
          <FlatList
            data={song || []}
            renderItem={({ item, index }) => (
              <>
                {console.log(item)}
                <LikedSongComponent
                  song={item.song}
                  image={item.image}
                  song_url={item.song_url}
                  primary_artists={item.primary_artists}
                  duration={item.duration}
                  index={index}
                  allSongs={song || []}
                  onDelete={getLikedSongs}
                />
              </>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </>
  );
};

export default likedSongs;

const styles = StyleSheet.create({
  backImg: {
    width: 12,
    height: 12,
    borderRadius: 25,
  },
  textStyle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 17,
  },
});
