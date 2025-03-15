import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import "@/global.css";
import HomeBtns from "@/components/homeBtns";
import Trending from "@/components/trending";
import useFetch from "@/services/useFetch";
import { fetchMusic } from "@/services/api";

const Home = () => {
  const [active, setActive] = useState("Trending");
  const [greetings, setGreetings] = useState("Good Morning");
  const {
    data: music,
    loading: musicLoading,
    error: musicError,
  } = useFetch(() =>
    fetchMusic({
      query: "",
    })
  );

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
      <View className="w-full">
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
        <View className="w-full flex flex-row items-center gap-2 pt-5 pl-5">
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
            {active === "Recent" ? `${active} Hits` : `${active} Songs`}
          </Text>
        </View>
        {musicLoading ? (
          <ActivityIndicator size="large" color="#000ff" />
        ) : musicError ? (
          <Text>Something went wrong</Text>
        ) : (
          <FlatList
            data={music?.songs || []}
            renderItem={({ item }) => (
              <Trending
                type={active}
                song={item.song}
                image={item.image}
                music={item.music}
                duration={item.duration}
                primary_artists={item.primary_artists}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});
