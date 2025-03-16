import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import searchImg from "@/assets/images/search.png";
import closeImg from "@/assets/images/close.png";
import { fetchMusic } from "@/services/api";
import useFetch from "@/services/useFetch";
import Trending from "@/components/trending";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelDisplay, setCancelDisplay] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [userCancelled, setUserCancelled] = useState(false);

  const {
    data: music,
    loading,
    error,
    refetch,
    reset,
  } = useFetch(() => fetchMusic({ query: debouncedQuery }), [debouncedQuery]);
  console.log(music);
  useEffect(() => {
    setCancelDisplay(searchQuery.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && !userCancelled) {
        setDebouncedQuery(searchQuery);
      }
      setUserCancelled(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setDebouncedQuery("");
    setUserCancelled(true);
    reset();
  }, [reset]);

  return (
    <SafeAreaView>
      <View className="pt-10 pl-5">
        <Text style={styles.textFont}>Search</Text>
        <View className="pr-5 relative">
          <Image source={searchImg} style={styles.img} />

          {cancelDisplay && (
            <Pressable onPress={handleClearSearch} style={styles.cancel}>
              <Image source={closeImg} style={styles.cancelImg} />
            </Pressable>
          )}
          <TextInput
            style={styles.SearchtextFont}
            className="bg-gray-200 w-full mt-3 p-4 pl-10 rounded-md"
            placeholder="Search for a song"
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>

        <View className="pr-5 mt-3">
          {searchQuery === "" ? (
            ""
          ) : loading ? (
            <View className="items-center mt-10">
              <Text className="text-black" style={styles.textFont}>
                Searching...
              </Text>
              <ActivityIndicator size={"large"} color={"#000"} />
            </View>
          ) : error ? (
            <Text className="text-red-600 mt-5" style={styles.textFont}>
              Error: {error.message}
            </Text>
          ) : (
            <>
              {searchQuery.trim() && (
                <Text className="mb-4" style={styles.SearchtextFont}>
                  {music?.length
                    ? `Search results for "${searchQuery}"`
                    : `No results found for "${searchQuery}"`}
                </Text>
              )}

              <FlatList
                data={music || []}
                renderItem={({ item }) => (
                  <>
                    {searchQuery != "" ? (
                      <Trending
                        song={item.song}
                        image={item.image}
                        music={item.music}
                        duration={item.duration}
                        primary_artists={item.primary_artists}
                      />
                    ) : (
                      ""
                    )}
                  </>
                )}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => `${item.song}-${index}`}
                windowSize={5}
                maxToRenderPerBatch={5}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews={true}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Search;

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
