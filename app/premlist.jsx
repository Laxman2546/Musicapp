import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import useFetch from "@/services/useFetch";
import { fetchMusic } from "@/services/api";
import backIcon from "@/assets/images/previous.png";
import { goBack } from "expo-router/build/global-state/routing";
import Trending from "@/components/trending";
const premlist = () => {
  const { premaUrl, listname, designImage } = useLocalSearchParams();
  const { data, loading, error } = useFetch(
    () => fetchMusic({ premaUrl }),
    [premaUrl]
  );
  const imageSource = (image) => {
    if (typeof image == "string" && image.startsWith("http")) {
      return { uri: designImage };
    }
    return require("../assets/images/musicImage.png");
  };
  const handleBack = () => {
    router.push(goBack);
  };
  return (
    <View>
      <View className="relative">
        <Pressable onPress={handleBack} className="z-50">
          <Image
            className="absolute left-4 top-6"
            source={backIcon}
            style={{
              width: 35,
              height: 35,
            }}
          />
        </Pressable>
        <Image
          source={imageSource(designImage)}
          resizeMode="contain"
          style={styles.designImage}
        />
      </View>
      <View className="p-3 ml-4">
        <View>
          <Text style={styles.fontStyle}>{listname || "Nanimusic"}</Text>
        </View>
        <View>
          {loading || (!data && !error) ? (
            <ActivityIndicator size="large" color="#000" />
          ) : error ? (
            <View>
              <Text>Something went wrong {error}</Text>
            </View>
          ) : (
            <>
              <View
                style={{
                  marginBottom: 2050,
                }}
              >
                <FlatList
                  data={data?.songs || []}
                  windowSize={5}
                  maxToRenderPerBatch={5}
                  updateCellsBatchingPeriod={50}
                  removeClippedSubviews={true}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <>
                      <Trending
                        song={item.song}
                        image={item.image}
                        music={item.music}
                        duration={item.duration}
                        primary_artists={item.primary_artists}
                        song_url={item.media_url}
                        index={index}
                        allSongs={data?.songs || []}
                      />
                    </>
                  )}
                  keyExtractor={(item, index) => `${item.song}-${index}`}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default premlist;

const styles = StyleSheet.create({
  designImage: {
    width: "100%",
    height: 300,
  },
  fontStyle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});
