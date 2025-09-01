import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import React from "react";
import ChartsComponent from "./chartsComponent";

const PlaylistComponent = ({ data }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mt-5 mb-[200px]">
        {data.map((items, index) => (
          <View key={index}>
            <Text style={styles.activeText} className="text-xl">
              {items.category}
            </Text>
            <FlatList
              data={items.playlists || []}
              contentContainerStyle={styles.flatListContent}
              horizontal
              showsHorizontalScrollIndicator={false}
              windowSize={5}
              maxToRenderPerBatch={5}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={true}
              renderItem={({ item, index }) => (
                <ChartsComponent
                  listname={item.title}
                  premaUrl={item.perma_url}
                  image={item.image}
                  index={index}
                />
              )}
              keyExtractor={(item, index) =>
                item.title ? `${item.title}-${index}` : `${index}`
              }
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default PlaylistComponent;

const styles = StyleSheet.create({
  activeText: {
    fontFamily: "Poppins-SemiBold",
  },
  flatListContent: {
    paddingRight: 15,
  },
});
