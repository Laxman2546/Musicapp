import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { SvgUri } from "react-native-svg";

const EditProfile = () => {
  const [username, setUsername] = useState("");
  const [editName, setEditName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarName, setAvatarname] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const generateRandNum = () => {
    const newAvatar = username + Math.floor(Math.random() * 1000);
    setAvatarname(newAvatar);
  };

  const getUsername = async () => {
    try {
      setIsLoading(true);
      const userprofileName = await AsyncStorage.getItem("profileName");
      const userprofileAvatar = await AsyncStorage.getItem("avatar");
      const name =
        userprofileName && userprofileName.length > 0
          ? userprofileName
          : "user";
      const avatar =
        userprofileAvatar && userprofileAvatar.length > 0
          ? userprofileAvatar
          : "user18";
      setAvatarname(avatar);
      setEditAvatar(avatar);
      setUsername(name);
      setEditName(name);
    } catch (error) {
      console.error("Error loading username:", error);
      setUsername("user");
      setEditName("user");
      setAvatarname("user18");
      setEditAvatar("user18");
    } finally {
      setIsLoading(false);
    }
  };

  const setName = async (name) => {
    try {
      await AsyncStorage.setItem("profileName", name);
    } catch (error) {
      console.error("Error saving username:", error);
    }
  };

  const setAvatar = async (avatar) => {
    try {
      await AsyncStorage.setItem("avatar", avatar);
    } catch (error) {
      console.error("Error generating avatar:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUsername();
    }, [])
  );

  const handleSave = async () => {
    setIsSaving(true);

    const finalUsername = username.trim() || "user";
    await setName(finalUsername);
    setUsername(finalUsername);
    setEditName(finalUsername);

    const finalAvatar = avatarName.trim() || "user18";
    await setAvatar(finalAvatar);
    setEditAvatar(finalAvatar);

    setIsSaving(false);

    router.back();
  };

  const handleCancel = () => {
    setUsername(editName);
    setAvatarname(editAvatar);
    router.back();
  };

  const hasChanges =
    (username.trim() !== editName || avatarName.trim() !== editAvatar) &&
    username.trim() !== "";

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-5 pt-16 pb-10">
          <View className="w-full flex flex-row gap-3 items-center mt-3">
            <Pressable
              onPress={handleCancel}
              className="p-2 bg-gray-100 rounded-full"
              style={styles.backButton}
            >
              <Ionicons name="arrow-back-outline" size={24} color="#333" />
            </Pressable>
            <Text style={styles.headerText} className="text-2xl">
              Edit Profile
            </Text>
          </View>

          <View className="w-full items-center mt-16">
            <View className="relative">
              <View
                className="p-3 rounded-full shadow-lg"
                style={styles.avatarGradient}
              >
                <View className="bg-white p-2 rounded-full">
                  <SvgUri
                    width="100"
                    height="100"
                    uri={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${avatarName}&radius=50&eyes=closed,closed2,cute,glasses,pissed,plain,shades,wink2,wink&mouth=cute,drip,shout,wideSmile,smileTeeth,smileLol`}
                  />
                </View>
              </View>

              <Pressable
                onPress={generateRandNum}
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-4 border-white active:bg-blue-700"
                style={styles.editBadge}
              >
                <Ionicons name="camera" size={20} color="white" />
              </Pressable>
            </View>

            <Pressable
              onPress={generateRandNum}
              className="mt-6 px-6 py-3 bg-gray-100 rounded-xl active:bg-gray-200"
              style={styles.changeAvatarButton}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons name="shuffle-outline" size={18} color="#374151" />
                <Text className="text-gray-800 font-semibold text-base">
                  Change Avatar
                </Text>
              </View>
            </Pressable>

            {/* Avatar change indicator */}
            {avatarName !== editAvatar && (
              <View className="mt-3 px-4 py-2 bg-blue-50 rounded-lg">
                <Text className="text-blue-600 text-sm font-medium">
                  Avatar updated! Don't forget to save
                </Text>
              </View>
            )}
          </View>

          {/* Name Input Section */}
          <View className="w-full mt-12 mb-6">
            <Text style={styles.labelText} className="mb-2">
              Display Name
            </Text>
            <View className="relative">
              <TextInput
                className="bg-gray-50 w-full p-4 pr-12 rounded-xl border-2 border-gray-200 text-base"
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#9CA3AF"
                onChangeText={setUsername}
                value={username}
                maxLength={30}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {username.length > 0 && (
                <Pressable
                  onPress={() => setUsername("")}
                  className="absolute right-4 top-4"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </Pressable>
              )}
            </View>
            <Text className="text-gray-500 text-sm mt-2 ml-1">
              {username.length}/30 characters
            </Text>
          </View>

          {/* Action Buttons */}
          {hasChanges && (
            <View className="w-full flex-row gap-3 mt-4 mb-6">
              <Pressable
                onPress={handleCancel}
                className="flex-1 p-4 rounded-xl bg-gray-100 active:bg-gray-200"
                style={styles.cancelButton}
              >
                <Text className="font-semibold text-gray-700 text-center text-base">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                disabled={isSaving}
                className="flex-1 p-4 rounded-xl bg-blue-600 active:bg-blue-700"
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="font-semibold text-white text-center text-base">
                    Save Changes
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  headerText: {
    fontFamily: "Poppins-SemiBold",
    color: "#1F2937",
  },
  backButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarGradient: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  editBadge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  labelText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#374151",
  },
  input: {
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },
  changeAvatarButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButton: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});
