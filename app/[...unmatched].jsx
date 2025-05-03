import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React from "react";
import { router } from "expo-router";
import backIcon from "@/assets/images/backImg.png";

export default function NotFoundScreen() {
  const handleBack = () => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Oops! 😕</Text>
        <Text style={styles.message}>
          We couldn't find what you're looking for.
        </Text>
        <Pressable onPress={handleBack} style={styles.button}>
          <View className="flex flex-row items-center gap-2 bg-black p-4 rounded-xl">
            <Image source={backIcon} style={styles.backImg} />
            <Text style={styles.buttonText}>Go Back Home</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: 32,
    marginBottom: 10,
  },
  message: {
    fontFamily: "Poppins-Regular",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  backImg: {
    width: 15,
    height: 15,
    tintColor: "#fff",
  },
});
