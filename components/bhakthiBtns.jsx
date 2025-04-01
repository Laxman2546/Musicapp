import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";

const bhakthiBtns = ({ btnName, handlePress, btnactive }) => {
  return (
    <View
      className="flex flex-row"
      style={{
        height: 50,
        marginBottom: 20,
        paddingTop: 2,
        paddingBottom: 2,
        paddingRight: 5,
      }}
    >
      <Pressable
        style={{
          backgroundColor: btnactive === btnName ? "#000" : "#D3D3D3",
          padding: 12,
          paddingLeft: 25,
          paddingRight: 25,
          borderRadius: 10,
        }}
        onPress={handlePress}
      >
        <Text
          className="text-md "
          style={{
            color: btnactive === btnName ? "#fff" : "#000",
            fontWeight: btnactive === btnName ? "bold" : "normal",
          }}
        >
          {btnName}
        </Text>
      </Pressable>
    </View>
  );
};

export default bhakthiBtns;

const styles = StyleSheet.create({});
