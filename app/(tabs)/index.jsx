import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import "@/global.css";
import HomeBtns from "@/components/homeBtns";
import Trending from "@/components/trending";
const Home = () => {
  const [active, setActive] = useState("Trending");
  const [greetings, setGreetings] = useState("Good Morning");
  useEffect(() => {
    const date = new Date();
    const hrs = date.getHours();
    if (hrs < 12) {
      setGreetings("Good Morning");
    } else if (hrs < 18) {
      setGreetings("Good Afternoon");
    } else {
      setGreetings("Good Evening");
    }
  }, []);
  return (
    <SafeAreaView className="bg-slate-50 h-full">
      <ScrollView>
        <View className="w-full  ">
          <View className="w-full flex pt-10 pl-5 gap-1">
            <View>
              <Text
                style={{
                  fontFamily: "Nunito-Regular",
                }}
                className="text-xl"
              >
                Hello,
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontFamily: "Nunito-Black",
                }}
                className="text-2xl"
              >
                {greetings}
              </Text>
            </View>
          </View>
          <View className="w-full  flex flex-row  items-center gap-2 pt-5 pl-5">
            <HomeBtns
              btnName="Trending"
              handlePress={() => {
                setActive("Trending");
              }}
              btnactive={active}
            />
            <HomeBtns
              btnName="Popular"
              handlePress={() => {
                setActive("Popular");
              }}
              btnactive={active}
            />
            <HomeBtns
              btnName="Recent"
              handlePress={() => {
                setActive("Recent");
              }}
              btnactive={active}
            />
          </View>
          <View className="pt-5 pl-5">
            <Text
              style={{
                fontFamily: "Poppins-SemiBold",
              }}
              className="text-xl"
            >
              {active} Songs
            </Text>
          </View>
          <View className="pt-5 pl-5">
            <Trending />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});
