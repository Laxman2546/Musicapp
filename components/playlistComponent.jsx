import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import ChartsComponent from "./chartsComponent";
const playlistComponent = ({ data }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View>
        <View className="mt-5 mb-[100px]">
          {data.map((items, index) => (
            <>
              <View key={index}>
                <Text style={styles.activeText}>{items.category}</Text>
                <FlatList
                  key={index}
                  data={items.playlists || []}
                  contentContainerStyle={styles.flatListContent}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  windowSize={5}
                  maxToRenderPerBatch={5}
                  updateCellsBatchingPeriod={50}
                  removeClippedSubviews={true}
                  renderItem={({ item, index }) => (
                    <>
                      <ChartsComponent
                        listname={item.title}
                        premaUrl={item.perma_url}
                        image={item.image}
                        index={index}
                      />
                    </>
                  )}
                  keyExtractor={(item, index) => `${item.song}-${index}`}
                />
              </View>
            </>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default playlistComponent;

const styles = StyleSheet.create({
  activeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
  flatListContent: {
    paddingRight: 15,
  },
});
