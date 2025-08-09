import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import useFetch from "@/services/useFetch";
import { fetchMusic } from "@/services/api";
import Trending from "./trending";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
const Recentrelease = () => {
  const { playSong } = usePlayer();
  const {
    data: music,
    loading,
    error,
    refetch,
    loadMore,
  } = useFetch(() => fetchMusic({ query: "", type: "Recent" }), []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.Heading}>Fetching Recent Release...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.Heading}>Error loading songs</Text>
      </View>
    );
  }

  const groupSongsIntoColumns = (songs) => {
    const columns = [];
    for (let i = 0; i < songs.length; i += 3) {
      columns.push(songs.slice(i, i + 3));
    }
    return columns;
  };

  const columns = groupSongsIntoColumns(music?.songs || []);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.Heading}>Recent Releases</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {columns.map((column, columnIndex) => (
          <View key={`column-${columnIndex}`} style={styles.column}>
            {column.map((item, index) => (
              <TouchableOpacity
                key={`song-${columnIndex}-${index}`}
                style={styles.songItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (item && item.song) {
                    const songWithId = {
                      ...item,
                      id: `${columnIndex * 3 + index}`,
                      name: item.song,
                      artist: item.primary_artists,
                    };
                    playSong(
                      songWithId,
                      music?.songs || [],
                      columnIndex * 3 + index
                    );
                    router.push("/player");
                  }
                }}
              >
                <Trending
                  type={"Recent"}
                  song={item.song}
                  image={item.image}
                  music={item.music}
                  duration={item.duration}
                  primary_artists={item.primary_artists}
                  song_url={item.media_url}
                  index={columnIndex * 3 + index}
                  allSongs={music?.songs || []}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Recentrelease;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Heading: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  subHeading: {
    fontFamily: "Nunito-Bold",
    fontSize: 16,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  gridContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  gridItem: {
    marginHorizontal: 5,
    marginBottom: 10,
  },
  songItem: {
    minWidth: 300,
    marginRight: 12,
    overflow: "hidden",
  },
});
