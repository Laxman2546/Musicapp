import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import dheera from "@/assets/images/example.jpg";
import { SafeAreaView } from "react-native-safe-area-context";
const Trending = () => {
  return (
    <SafeAreaView className="h-full bg-black">
      <ScrollView>
        <View className="w-full">
          <View>
            <Image
              source={dheera}
              style={{
                width: 50,
                height: 50,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Trending;

const styles = StyleSheet.create({});
