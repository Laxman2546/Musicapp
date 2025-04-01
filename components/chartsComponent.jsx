import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { router } from "expo-router";
const chartsComponent = ({ listname, premaUrl, image, index, type }) => {
  const imageSource = (image) => {
    if (typeof image == "string" && image.startsWith("http")) {
      return { uri: image };
    }
    return require("../assets/images/musicImage.png");
  };
  const handlePlaylist = () => {
    router.push({
      pathname: "/premlist",
      params: {
        premaUrl: premaUrl,
        listname: listname || "unknown",
        designImage: image,
      },
    });
  };

  return (
    <View className="p-3">
      {type == "featured" ? (
        <>
          <Pressable onPress={handlePlaylist}>
            <View className="w-full flex align-middle justify-center text-center">
              <Image
                source={imageSource(image)}
                style={styles.feturedimageDesign}
              />
            </View>
            <View style={styles.size2}>
              <Text numberOfLines={2} style={styles.text}>
                {listname}
              </Text>
            </View>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable onPress={handlePlaylist}>
            <View>
              <Image source={imageSource(image)} style={styles.imageDesign} />
            </View>
            <View style={styles.size}>
              <Text numberOfLines={2} style={styles.text}>
                {listname}
              </Text>
            </View>
          </Pressable>
        </>
      )}
    </View>
  );
};

export default chartsComponent;

const styles = StyleSheet.create({
  imageDesign: {
    width: 130,
    height: 130,
    borderRadius: 15,
  },
  feturedimageDesign: {
    width: 130,
    height: 130,
    borderRadius: 15,
  },
  size: {
    width: 130,
  },
  size2: {
    width: 130,
  },
  text: {
    textAlign: "center",
    fontFamily: "Nunito-Bold",
  },
});
