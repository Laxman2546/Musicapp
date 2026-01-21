import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import LikedSongs from "../likedSongs";
const playlists = () => {
  return (
    <SafeAreaView>
      <View className="w-full flex flex-col p-5 pt-20">
        <Text style={styles.textFont}>Liked Songs</Text>
        <LikedSongs />
      </View>
    </SafeAreaView>
  );
};

export default playlists;

const styles = StyleSheet.create({
  textFont: {
    fontFamily: "Nunito-Bold",
    fontSize: 25,
  },
  activeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
});
