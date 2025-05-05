import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import backIcon from "@/assets/images/backImg.png";

export default function NotFoundScreen() {
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.replace("/");
    }, 1000); // 3 seconds delay


    return () => clearTimeout(redirectTimer);
  }, []);

  // Manual navigation function (if user wants to go back immediately)
  const handleBack = () => {
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.message}>
          Wait we Redirecting you to the home page...
        </Text>
        <Pressable onPress={handleBack} style={styles.button}>
          <View style={styles.buttonContainer}>
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
    marginBottom: 15,
    color: "#666",
  },
  redirectingText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    color: "#999",
    fontStyle: "italic",
  },
  button: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
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
