import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import splashImg from "@/assets/images/appicon.png";
import gifImage from "@/assets/images/welcomeGif.gif";
import Animated, { BounceInDown } from "react-native-reanimated";

const WelcomeComponent = () => {
  const customFadeIn = BounceInDown.springify()
    .damping(30)
    .mass(5)
    .stiffness(10)
    .overshootClamping(false)
    .restDisplacementThreshold(0.1)
    .restSpeedThreshold(5);

  return (
    <View className="w-full h-screen flex justify-center items-center relative">
      <View>
        <Image source={splashImg} style={styles.img} />
      </View>
      <View>
        <Animated.Text entering={customFadeIn} style={styles.text}>
          Nanimusic
        </Animated.Text>
      </View>
      <View className="absolute right-0">
        <Image source={gifImage} />
      </View>
    </View>
  );
};

export default WelcomeComponent;

export const styles = StyleSheet.create({
  img: {
    width: 200,
    height: 200,
  },
  text: {
    fontFamily: "Audiowide-Regular",
    fontSize: 20,
  },
  gif: {
    width: 40,
    height: 40,
  },
});
