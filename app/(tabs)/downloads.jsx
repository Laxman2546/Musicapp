import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import fileIcon from "@/assets/images/fileIcon.png";
import userIcon from "@/assets/images/user.png";
import editIcon from "@/assets/images/edit.png";
import saveIcon from "@/assets/images/save.png";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
const downloads = () => {
  const [username, setUsername] = useState("user");
  const [editName, setEditname] = useState(false);
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
    if (!userprofileName) {
      setUsername("user");
    }
    setUsername(userprofileName);
  };
  useEffect(() => {
    getName();
  }, []);
  return (
    <View className="w-full flex flex-col p-5">
      <Text style={styles.text}>Profile</Text>
      <View className="w-full flex items-center mt-5 gap-4">
        <View>
          <Image source={userIcon} style={styles.userImg} />
        </View>
        <View className="w-full flex flex-row items-center justify-center gap-2">
          <Text style={styles.text} className="mt-4">
            {username}
          </Text>
          <Pressable onPress={handleEdit}>
            <Image source={editIcon} style={styles.editImg} />
          </Pressable>
        </View>
        {editName && (
          <View className="w-full flex justify-center items-center relative">
            <TextInput
              style={styles.SearchtextFont}
              className="bg-gray-200 w-full mt-3 p-4 pl-5 rounded-md"
              placeholder="set your new name"
              onChangeText={setUsername}
              value={username}
            />

            <Pressable className="w-full absolute" onPress={handleSave}>
              <Image source={saveIcon} style={styles.saveImg} />
            </Pressable>
          </View>
        )}
      </View>
      <View className="pt-8 flex flex-col gap-3">
        <Pressable onPress={handleLocal}>
          <View className="w-full flex flex-row gap-6 p-5 rounded-2xl bg-[#D3D3D3] ">
            <Image
              source={fileIcon}
              style={styles.fileSize}
              resizeMode="contain"
            />
            <Text style={styles.textFont}>Local Songs</Text>
          </View>
        </Pressable>
        <Pressable onPress={handleDownload}>
          <View className="w-full flex flex-row gap-6  p-5 rounded-2xl bg-[#D3D3D3]">
            <Image
              source={fileIcon}
              style={styles.fileSize}
              resizeMode="contain"
            />
            <Text style={styles.textFont}>Downloaded songs</Text>
          </View>
        </Pressable>
        <Pressable onPress={handleLiked}>
          <View className="w-full flex flex-row gap-6  p-5 rounded-2xl bg-[#D3D3D3]">
            <Image
              source={fileIcon}
              style={styles.fileSize}
              resizeMode="contain"
            />
            <Text style={styles.textFont}>Liked songs</Text>
          </View>
        </Pressable>
      </View>
    </View>
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
