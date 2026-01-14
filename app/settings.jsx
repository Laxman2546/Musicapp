import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { SvgUri } from "react-native-svg";
const Settings = () => {
  const [username, setUsername] = useState("user");
  const handleBack = () => {
    router.back();
  };
  const getUsername = async () => {
    const userprofileName = await AsyncStorage.getItem("profileName");
    if (userprofileName?.length <= 0) {
      setUsername("user");
      handleSave();
    }
    setUsername(userprofileName);
  };

  useEffect(() => {
    getUsername();
  }, []);
  return (
    <View style={{ flex: 1 }} className="p-5 pt-16">
      <View className="w-full flex flex-row gap-3 items-center  mt-3">
        <Pressable onPress={handleBack}>
          <Ionicons
            name="arrow-back-outline"
            size={25}
            color="black"
            className="p-2 bg-gray-300 rounded-full"
          />
        </Pressable>
        <Text style={styles.textStyle}>Settings</Text>
      </View>
      <View className="mt-12 flex flex-col">
        <View className="flex flex-row gap-5 items-start">
          <SvgUri
            width="50"
            height="50"
            uri={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${username}7&radius=20&eyes=closed,closed2,cute,glasses,pissed,plain,shades,wink2,wink&mouth=cute,drip,shout,wideSmile,smileTeeth,smileLol`}
          />
          <View className="flex flex-col font-medium">
            <Text style={styles.textFont}>{username}</Text>
            <Text>Listner...</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  textStyle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    marginTop: 5,
    textAlign: "center",
  },
  textFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#333",
  },
});
