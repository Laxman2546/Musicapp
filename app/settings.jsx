import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { SvgUri } from "react-native-svg";
import { ChevronRight, RefreshCcw } from "lucide-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSettings } from "@/context/SettingsContext";
import ToggleSwitch from "toggle-switch-react-native";
import love from "@/assets/images/madeimg.png";
import { usePlayer } from "@/context/playerContext";

const Settings = () => {
  const handleBack = () => {
    router.back();
  };
  const {
    showFallback,
    setShowfallback,
    userIcon,
    showRadio,
    handleShowRadio,
    showRecently,
    handleShowRecently,
    redirectDownloads,
    handleRedirectDownloads,
    isInitials,
    username,
    avatarnName,
  } = useSettings();
  const {
    showVolume,
    handleShowVolume,
    shuffleToggle,
    toggleShuffle,
    showSongLyrics,
    handleShowSongLyrics,
  } = usePlayer();

  return (
    <View style={{ flex: 1 }} className=" pt-16">
      <View className="w-full  p-5 flex flex-row gap-3 items-center  mt-3">
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex flex-col gap-3 p-5">
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
                <Text className="text-blue-500 font-semibold">
                  Edit profile
                </Text>
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
                <Text className="font-medium text-md">
                  Always Shuffle Songs
                </Text>
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
                  onToggle={toggleShuffle}
                />
              </View>
            </View>
            <View className=" flex flex-row items-center justify-between">
              <View className="flex flex-col gap-1">
                <Text className="font-medium text-md">
                  Show Volume Controls
                </Text>
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
                  onToggle={handleShowVolume}
                />
              </View>
            </View>
            <View className=" flex flex-row items-center justify-between">
              <View className="flex flex-col gap-1">
                <Text className="font-medium text-md">
                  Hide Lyrics in player
                </Text>
                <Text className="max-w-1/2 text-gray-500 text-sm">
                  Hide Lyrics button to enhance performance
                </Text>
              </View>
              <View>
                <ToggleSwitch
                  isOn={showSongLyrics}
                  onColor="blue"
                  offColor="gray"
                  size="small"
                  onToggle={handleShowSongLyrics}
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
                  onToggle={handleShowRadio}
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
                  onToggle={handleRedirectDownloads}
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
                  onToggle={handleShowRecently}
                />
              </View>
            </View>
          </View>
          <Text style={styles.textStyle} className="text-lg">
            App Updates
          </Text>
          <Pressable>
            <View className="p-5 rounded-xl border-2 border-blue-100  bg-blue-50 shadow-md flex flex-col gap-4">
              <View className=" flex flex-row  items-center justify-between">
                <Text className="font-medium text-md">Check for Updates</Text>
                <View>
                  <RefreshCcw size={24} />
                </View>
              </View>
            </View>
          </Pressable>
          <View className="flex flex-row mt-3 items-center justify-center gap-1">
            <AntDesign name="star" size={20} color="#ffc000" />
            <Text className="font-medium text-md">Star it on</Text>
            <Text
              className="underline text-blue-500"
              onPress={() =>
                Linking.openURL("https://github.com/Laxman2546/Musicapp")
              }
            >
              Github
            </Text>
          </View>
        </View>
        <View className="w-full flex items-center bg-gray-200">
          <Image
            source={love}
            style={{ width: 900, height: 250 }}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
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
