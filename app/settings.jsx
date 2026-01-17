import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SvgUri } from "react-native-svg";
import { ChevronRight } from "lucide-react-native";
import { useSettings } from "@/context/SettingsContext";
import ToggleSwitch from "toggle-switch-react-native";
const Settings = () => {
  const [shuffleToggle, setShuffleToggle] = useState(false);
  const [showVolume, setShowvolume] = useState(false);
  const [showLyrics, setshowLyrics] = useState(false);
  const [showRadio, setshowRadio] = useState(false);
  const [showRecently, setshowRecently] = useState(false);
  const [redirectDownloads, setRedirectDownloads] = useState(false);
  const handleBack = () => {
    router.back();
  };
  const {
    showFallback,
    setShowfallback,
    userIcon,
    isInitials,
    username,
    avatarnName,
  } = useSettings();

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
        <Text style={styles.textStyle} className="text-lg">
          Profile Settings
        </Text>
        <View className="w-full p-5  bg-gray-100 shadow-md rounded-xl flex flex-row gap-3 items-center ">
          <View
            className={`p-1 ${!showFallback && "bg-black/70"} rounded-full`}
          >
            {showFallback ? (
              <Image
                source={userIcon}
                style={{ width: 40, height: 40, borderRadius: 50 }}
                resizeMode="cover"
              />
            ) : (
              <SvgUri
                width="40"
                height="40"
                uri={
                  isInitials
                    ? `https://api.dicebear.com/9.x/initials/svg?seed=${username}&radius=50&backgroundType=solid&chars=1`
                    : `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${avatarnName}&radius=50&eyes=closed,closed2,cute,glasses,pissed,plain,shades,wink2,wink&mouth=cute,drip,shout,wideSmile,smileTeeth,smileLol`
                }
                onError={() => setShowfallback(true)}
              />
            )}
          </View>
          <Pressable
            className="flex flex-col font-medium"
            onPress={() => router.push("/editProfile")}
          >
            <Text style={styles.textFont}>{username}</Text>
            <View className="flex flex-row items-center justify-start">
              <Text className="text-blue-500 font-semibold">Edit profile</Text>
              <ChevronRight size={15} color="#3b82f6" />
            </View>
          </Pressable>
        </View>
        <Text style={styles.textStyle} className="mt-3 text-lg">
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
              <Text className="font-medium text-md">Show Volume Controls</Text>
              <Text className="text-gray-500 text-sm">
                Hide/Show volume controls
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={showVolume}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setShowvolume(!showVolume)}
              />
            </View>
          </View>
          <View className=" flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-md">Hide Lyrics in player</Text>
              <Text className="max-w-1/2 text-gray-500 text-sm">
                Hide Lyrics button to enhance performance
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={showLyrics}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setshowLyrics(!showLyrics)}
              />
            </View>
          </View>
        </View>
        <Text style={styles.textStyle} className="mt-3 text-lg">
          Ui Settings
        </Text>
        <View className="p-5 rounded-xl bg-gray-100 shadow-md flex flex-col gap-4">
          <View className=" flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-md">Hide Live Radio</Text>
              <Text className="text-gray-500 text-sm">
                Hides radios in the home screen
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={showRadio}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setshowRadio(!showRadio)}
              />
            </View>
          </View>
          <View className=" flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-md">Open Downloads</Text>
              <Text className="text-gray-500 text-sm">
                Redirect to Downlaods while offline
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={redirectDownloads}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setRedirectDownloads(!redirectDownloads)}
              />
            </View>
          </View>
          <View className=" flex flex-row items-center justify-between">
            <View className="flex flex-col gap-1">
              <Text className="font-medium text-md">
                Hide recently released
              </Text>
              <Text className="max-w-1/2 text-gray-500 text-sm">
                Hide new songs in the home screen
              </Text>
            </View>
            <View>
              <ToggleSwitch
                isOn={showRecently}
                onColor="blue"
                offColor="gray"
                size="small"
                onToggle={() => setshowRecently(!showRecently)}
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
