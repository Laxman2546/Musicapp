import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import splashImg from "@/assets/images/spalshImage.png";
const welcomeComponent = () => {
  return (
    <View className="w-full h-screen flex justify-center items-center">
      <Image source={splashImg} style={styles.img} />
    </View>
  );
};

export default welcomeComponent;

export const styles = StyleSheet.create({
  img: {
    width: 300,
    height: 300,
  },
});
