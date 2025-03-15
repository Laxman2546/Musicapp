import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const search = () => {
  return (
    <SafeAreaView>
      <View className="pt-10 pl-5">
        <Text style={styles.textFont}>Search</Text>
        <View className="pr-3">
          <TextInput
            className="bg-red-600 w-full h-10 mt-4"
            placeholder="search for a song"
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
});
