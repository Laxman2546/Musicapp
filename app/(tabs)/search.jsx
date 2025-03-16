import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
import { fetchMusic } from "@/services/api";

const search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDisplay, setCancelDisplay] = useState(false);

  useEffect(() => {
    setCancelDisplay(searchQuery.length > 0);
  }, [searchQuery]);

  return (
    <SafeAreaView>
      <View className="pt-10 pl-5">
        <Text style={styles.textFont}>Search</Text>
        <View className="pr-3 relative">
          <Image source={searchImg} style={styles.img} />

          {cancelDisplay && (
            <Pressable onPress={() => setSearchQuery("")} style={styles.cancel}>
              <Image source={closeImg} style={styles.cancelImg} />
            </Pressable>
          )}
          <TextInput
            style={styles.SearchtextFont}
            className="bg-gray-200 w-full mt-3 p-4 pl-10 rounded-md"
            placeholder="Search for a song"
            onChangeText={(text) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default search;

const styles = StyleSheet.create({
  textFont: {
    fontFamily: "Nunito-Bold",
    fontSize: 25,
  },
  SearchtextFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
  },
  img: {
    width: 15,
    height: 15,
    position: "absolute",
    top: 32,
    left: 15,
    zIndex: 15,
  },
  cancel: {
    position: "absolute",
    top: 25,
    right: 0,
    zIndex: 15,
  },
  cancelImg: {
    width: 20,
    height: 20,
    position: "absolute",
    top: 5,
    right: 30,
    zIndex: 15,
  },
});
