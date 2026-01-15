import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import { SvgUri } from "react-native-svg";
import { ChevronRight } from "lucide-react-native";
import ToggleSwitch from "toggle-switch-react-native";
const Settings = () => {
  const [username, setUsername] = useState("user");
  const [shuffleToggle, setShuffleToggle] = useState(false);
  const handleBack = () => {
    router.back();
  };
  const getUsername = async () => {
    const userprofileName = await AsyncStorage.getItem("profileName");
    if (userprofileName?.length <= 0) {
      setUsername("user");
    }
    setUsername(userprofileName);
  };
  console.log(username);
  useFocusEffect(
    useCallback(() => {
      getUsername();
    }, [])
  );
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
        <Text style={styles.textStyle} className="text-xl">
          Settings
        </Text>
      </View>
      <View className="mt-8 flex flex-col gap-3">
        <Text style={styles.textStyle} className="text-md">
          Profile Settings
        </Text>
        <View className="w-full p-5  bg-gray-100 shadow-md rounded-xl flex flex-row gap-3 items-center ">
          <View className="p-1 bg-black/70 rounded-full">
            <SvgUri
              width="40"
              height="40"
              uri={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${
                username != "user" ? username : "user18"
              }&radius=50&eyes=closed,closed2,cute,glasses,pissed,plain,shades,wink2,wink&mouth=cute,drip,shout,wideSmile,smileTeeth,smileLol`}
            />
          </View>
          <View className="flex flex-col font-medium">
            <Text style={styles.textFont}>{username}</Text>
            <View className="flex flex-row items-center justify-center">
              <Text className="text-blue-500 font-semibold">Edit profile</Text>
              <ChevronRight size={15} color="#3b82f6" />
            </View>
          </View>
        </View>
        <Text style={styles.textStyle} className="mt-5">
          Songs Settings
        </Text>
        <View className="p-5 rounded-xl bg-gray-100 shadow-md flex flex-col gap-4">
          <View className=" flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-md">Always Shuffle Songs</Text>
              <Text className="text-gray-500 text-sm">
                Plays random songs every time
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={shuffleToggle}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setShuffleToggle(!shuffleToggle)}
              />
            </View>
          </View>
          <View className=" flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-md">Always Shuffle Songs</Text>
              <Text className="text-gray-500 text-sm">
                Plays random songs every time
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={shuffleToggle}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setShuffleToggle(!shuffleToggle)}
              />
            </View>
          </View>
          <View className=" flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-md">Always Shuffle Songs</Text>
              <Text className="text-gray-500 text-sm">
                Plays random songs every time
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={shuffleToggle}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setShuffleToggle(!shuffleToggle)}
              />
            </View>
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
  },
  textFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#333",
  },
});
