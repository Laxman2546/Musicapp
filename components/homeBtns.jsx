import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";

const homeBtns = ({ btnName, handlePress, btnactive }) => {
  return (
    <View
      className="flex flex-row "
      style={{
        paddingRight: 5,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: btnactive === btnName ? "#000" : "#D3D3D3",
          padding: 10,
          paddingLeft: 25,
          paddingRight: 25,
          borderRadius: 50,
        }}
        onPress={handlePress}
      >
        <Text
          style={{
            color: btnactive === btnName ? "#fff" : "#000",
          }}
        >
          {btnName}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default homeBtns;

const styles = StyleSheet.create({});
