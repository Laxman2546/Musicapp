import { StyleSheet, Text, View } from "react-native";
import React from "react";
import PlaylistComponent from "@/components/playlistComponent";
import data from "@/constants/playlist";
const playlists = () => {
  return (
    <>
      <View className="pt-5 pl-5">
        <Text style={styles.textFont}>Playlists</Text>
        <PlaylistComponent data={data} />
      </View>
    </>
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
