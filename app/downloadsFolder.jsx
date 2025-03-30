import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { goBack } from "expo-router/build/global-state/routing";
import backIcon from "@/assets/images/backImg.png";
import Trending from "@/components/trending";
import { router } from "expo-router";
import DownloadComponent from "@/components/downloadComponent";
const downloadsFolder = () => {
  const [songs, setSongs] = React.useState([]);
  const loadSongs = async () => {
    try {
      const data = await AsyncStorage.getItem("downloadedSongs");
      setSongs(data ? JSON.parse(data) : []);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    loadSongs();
  }, []);
  console.log(songs);
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
          <Text style={styles.textStyle}>Downloads</Text>
        </View>
        <View>
          <FlatList
            data={songs || []}
            className="mb-16"
            renderItem={({ item, index }) => (
              <>
                <DownloadComponent
                  song={item.song}
                  image={item.image}
                  song_url={item.filePath}
                  primary_artists={item.primary_artists}
                  duration={item.duration}
                  index={index}
                  allSongs={songs || []}
                  onDelete={loadSongs}
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

export default downloadsFolder;

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
});
