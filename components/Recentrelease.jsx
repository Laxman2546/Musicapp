import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useState, useCallback, useEffect, memo } from "react";
import useFetch from "@/services/useFetch";
import { fetchMusic } from "@/services/api";
import Trending from "./trending";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";

const ITEMS_PER_PAGE = 9; // Show 3 sets of 3 songs initially
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_WIDTH = SCREEN_WIDTH * 0.85; // 85% of screen width for better visibility

const RecentColumn = memo(({ songs, startIndex, onPress }) => {
  return (
    <View style={styles.column}>
      {songs.map((item, idx) => (
        <TouchableOpacity
          key={item.id || `song-${startIndex + idx}`}
          style={styles.songItem}
          activeOpacity={0.7}
          onPress={() => onPress(item, startIndex + idx)}
        >
          <Trending
            type="Recent"
            song={item.song || item.name}
            image={item.image}
            music={item.music}
            duration={item.duration}
            primary_artists={item.primary_artists}
            song_url={item.media_url}
            index={startIndex + idx}
            allSongs={[]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
});

const Recentrelease = () => {
  const { playSong } = usePlayer();
  const [page, setPage] = useState(0);
  const [visibleSongs, setVisibleSongs] = useState([]);

  const {
    data: music,
    loading,
    error,
  } = useFetch(() => fetchMusic({ query: "", type: "Recent" }), []);

  const handleSongPress = useCallback(
    (item, index) => {
      const songWithId = {
        ...item,
        id: item.id || `recent-${index}`,
        name: item.song || item.name,
        artist: item.primary_artists,
      };
      playSong(songWithId, music?.songs || [], index);
      router.push("/player");
    },
    [music?.songs, playSong]
  );

  const groupSongsIntoColumns = useCallback((songs) => {
    const columns = [];
    const songsPerColumn = 3;

    for (let i = 0; i < songs.length; i += songsPerColumn) {
      columns.push(songs.slice(i, i + songsPerColumn));
    }
    return columns;
  }, []);

  useEffect(() => {
    if (music?.songs) {
      const end = (page + 1) * ITEMS_PER_PAGE;
      const songSlice = music.songs.slice(0, end);
      setVisibleSongs(groupSongsIntoColumns(songSlice));
    }
  }, [music?.songs, page, groupSongsIntoColumns]);

  const renderColumn = useCallback(
    ({ item: songs, index: columnIndex }) => (
      <RecentColumn
        songs={songs}
        startIndex={columnIndex * 3}
        onPress={handleSongPress}
      />
    ),
    [handleSongPress]
  );

  if (loading && page === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Fetching Recent Release...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Error loading songs</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Recent Releases</Text>
      <FlatList
        horizontal
        data={visibleSongs}
        renderItem={renderColumn}
        keyExtractor={(_, index) => `recent-column-${index}`}
        showsHorizontalScrollIndicator={false}
        onEndReached={() => {
          if (music?.songs && visibleSongs.length * 3 < music.songs.length) {
            setPage((prev) => prev + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        initialNumToRender={3}
        windowSize={3}
        getItemLayout={(_, index) => ({
          length: COLUMN_WIDTH + 20, // Include marginRight
          offset: (COLUMN_WIDTH + 20) * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
        snapToInterval={COLUMN_WIDTH + 20} // Snap to column width + margin
        decelerationRate="fast"
        pagingEnabled={false}
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  heading: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingHorizontal: 10,
  },
  column: {
    width: COLUMN_WIDTH,
    marginRight: 20,
  },
  songItem: {
    marginBottom: 5,
  },
});

export default memo(Recentrelease);
