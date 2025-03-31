import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import React from "react";
import fileIcon from "@/assets/images/fileIcon.png";
import { router } from "expo-router";
const downloads = () => {
  const handleLocal = () => {
    router.push("/localFiles");
  };
  const handleDownload = () => {
    router.push("/downloadsFolder");
  };
  const handleLiked = () => {
    router.push("/likedSongs");
  };

  return (
    <View className="w-full flex flex-col p-5">
      <Text style={styles.text}>All Songs</Text>
      <View className="pt-8 flex flex-col gap-3">
        <Pressable onPress={handleLocal}>
          <View className="w-full flex flex-row gap-6 p-5 rounded-2xl bg-[#D3D3D3] ">
            <Image
              source={fileIcon}
              style={styles.fileSize}
              resizeMode="contain"
            />
            <Text style={styles.textFont}>Local Songs</Text>
          </View>
        </Pressable>
        <Pressable onPress={handleDownload}>
          <View className="w-full flex flex-row gap-6  p-5 rounded-2xl bg-[#D3D3D3]">
            <Image
              source={fileIcon}
              style={styles.fileSize}
              resizeMode="contain"
            />
            <Text style={styles.textFont}>Downloaded songs</Text>
          </View>
        </Pressable>
        <Pressable onPress={handleLiked}>
          <View className="w-full flex flex-row gap-6  p-5 rounded-2xl bg-[#D3D3D3]">
            <Image
              source={fileIcon}
              style={styles.fileSize}
              resizeMode="contain"
            />
            <Text style={styles.textFont}>Liked songs</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default downloads;

const styles = StyleSheet.create({
  text: {
    fontFamily: "Nunito-Bold",
    fontSize: 20,
  },
  textFont: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  fileSize: {
    width: 20,
    height: 20,
  },
});
