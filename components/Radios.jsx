import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";
import fmData from "../constants/fmData.js";
import defaultMusicImage from "@/assets/images/musicImage.png";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
const Radios = () => {
  const { playSong } = usePlayer();

  const handleRadioPress = (station, index) => {
    // Format the radio station data to match the player's expected format
    const radioData = {
      id: `radio-${index}`,
      song: station.Name,
      name: station.Name,
      image: station.image,
      music: station.link, // The streaming URL
      song_url: station.link,
      duration: "Live", // For live radio
      primary_artists: "Live",
      artist: "Live",
      isRadio: true,
    };

    playSong(
      radioData,
      fmData.map((fm) => ({
        ...fm,
        song: fm.Name,
        name: fm.Name,
        music: fm.link,
        song_url: fm.link,
        duration: "Live",
        primary_artists: "Live",
        artist: "Live",
        isRadio: true,
      })),
      index
    );
    router.push("/player");
  };

  return (
    <View>
      <Text
        className="text-xl"
        style={{
          fontFamily: "Poppins-SemiBold",
        }}
      >
        Radio Fm
      </Text>
      <FlatList
        data={fmData || []}
        contentContainerStyle={styles.flatListContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        windowSize={5}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => handleRadioPress(item, index)}
            className="flex flex-col"
            activeOpacity={0.7}
          >
            <Image
              source={item.image ? { uri: item.image } : defaultMusicImage}
              style={styles.feturedimageDesign}
            />
            <Text style={styles.fmName} className="max-w-[150px] text-wrap">
              {item.Name}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) =>
          item.Name ? `${item.Name}-${index}` : `${index}`
        }
      />
    </View>
  );
};

export default Radios;

const styles = StyleSheet.create({
  activeText: {
    fontFamily: "Poppins-SemiBold",
  },
  flatListContent: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    borderRadius: "50%",
    paddingRight: 15,
    marginTop: 10,
    textAlign: "center",
  },
  feturedimageDesign: {
    width: 130,
    height: 130,
    borderRadius: 100,
    objectFit: "cover",
  },
  fmName: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
});
