import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
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
  } = useFetch(() => fetchMusic({ query: "", active }), [active]);

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
          <Text style={styles.greetingText}>Hello,</Text>
          <Text style={styles.greetingName}>{greetings}</Text>
        </View>

        <View className="w-full flex flex-row items-center gap-2 pt-5 pl-5">
          <HomeBtns
            btnName="Trending"
            handlePress={() => setActive("Trending")}
            btnactive={active}
          />
          <HomeBtns
            btnName="Popular"
            handlePress={() => setActive("Popular")}
            btnactive={active}
          />
          <HomeBtns
            btnName="Recent"
            handlePress={() => setActive("Recent")}
            btnactive={active}
          />
        </View>

        {/* Active Section Header */}
        <View className="pt-5 pl-5">
          <Text style={styles.activeText}>
            {active === "Recent" ? `${active} Release` : `${active} Songs`}
          </Text>
        </View>

        {/* Loading/Error Handling */}
        {musicLoading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : musicError ? (
          <Text style={styles.errorText}>
            Something went wrong: {musicError.message}
          </Text>
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
            ListFooterComponent={
              active === "Trending" ? null : (
                <View style={styles.footerContainer}>
                  {music?.songs.length === 0 ? (
                    <Text style={styles.emptyText}>No songs available</Text>
                  ) : (
                    <Text style={styles.footerText}>
                      You’ve caught them all! 🎶
                    </Text>
                  )}
                </View>
              )
            }
            keyExtractor={(item, index) => index.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  greetingText: {
    fontFamily: "Nunito-Regular",
    fontSize: 18,
  },
  greetingName: {
    fontFamily: "Nunito-Black",
    fontSize: 24,
  },
  activeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  footerContainer: {
    marginBottom: 250,
    marginTop: 25,
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  footerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
  emptyText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
    color: "gray",
  },
});

export default Home;
