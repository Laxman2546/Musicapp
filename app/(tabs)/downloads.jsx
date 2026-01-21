import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import DownloadsFolder from "../downloadsFolder";
import { checkForUpdates } from "../../services/Checkupdates";

const downloads = () => {
  const [username, setUsername] = useState("user");
  const [editName, setEditname] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const handleLocal = () => {
    router.push("/localFiles");
  };
  const handleDownload = () => {
    router.push("/downloadsFolder");
  };
  const handleLiked = () => {
    router.push("/likedSongs");
  };
  const handleEdit = () => {
    setEditname(!editName);
  };
  const handleSave = () => {
    if (!username) {
      setUsername("user");
      setEditname(false);
    }
    setEditname(false);
    setName();
  };
  const setName = async () => {
    const name = await AsyncStorage.setItem("profileName", username);
  };
  const getName = async () => {
    const userprofileName = await AsyncStorage.getItem("profileName");
    if (userprofileName?.length <= 0) {
      setUsername("user");
      handleSave();
    }
    setUsername(userprofileName);
  };
  useEffect(() => {
    getName();
  }, []);
  return (
    <SafeAreaView>
      <View className="w-full flex flex-col p-5">
        <Text style={styles.text}>Downloads</Text>
        <View className="w-full h-screen">
          <DownloadsFolder />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default downloads;

const styles = StyleSheet.create({
  text: {
    fontFamily: "Nunito-Bold",
    fontSize: 20,
  },
  textFont: {
    fontFamily: "Nunito-Regular",
    fontSize: 16,
  },
  fileSize: {
    width: 20,
    height: 20,
  },
  userImg: {
    width: 50,
    height: 50,
  },
  editImg: {
    width: 15,
    height: 15,
    position: "absolute",
  },
  saveImg: {
    width: 20,
    height: 20,
    position: "absolute",
    right: 60,
    top: -5,
  },
  SearchtextFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    width: 250,
    height: 60,
    paddingRight: 50,
  },
});
