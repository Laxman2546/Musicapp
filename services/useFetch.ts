import { useEffect, useState, useRef, useCallback } from "react";
import { MUSIC_CONFIG } from "@/services/api";

// Enhanced version of useFetch that supports playlist rotation
const useFetch = <T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFunctionRef = useRef(fetchFunction);
  const initialLoadRef = useRef<boolean>(true);

  // Store merged songs from multiple playlist fetches
  const allSongsRef = useRef<any[]>([]);

  // Keep track of playlist indices per category - sync with api.js
  const categoryIndices = useRef({
    Trending: 0,
    Popular: 0,
    Recent: 0,
    English: 0,
    Hindi: 0,
  });

  // Keep reference to playlist URLs
  const playlistUrls = useRef(MUSIC_CONFIG.PLAYLISTS);

  // Reset data when dependencies change (like when category changes)
  useEffect(() => {
    if (!initialLoadRef.current) {
      allSongsRef.current = [];
    }
  }, [...dependencies]);

  const fetchData = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
      }
      setError(null);

      const result = await fetchFunctionRef.current();

      if (loadMore) {
        // Merge new songs with existing songs, avoiding duplicates
        if (result && typeof result === "object" && "songs" in result) {
          const existingSongs = new Set(
            allSongsRef.current.map((song) => song.song)
          );
          const uniqueNewSongs = Array.isArray(result.songs)
            ? result.songs.filter((song) => !existingSongs.has(song.song))
            : [];

          const mergedSongs = [...allSongsRef.current, ...uniqueNewSongs];
          allSongsRef.current = mergedSongs;

          // Update the data with merged songs
          setData((prev) => {
            if (prev && typeof prev === "object" && "songs" in prev) {
              return {
                ...prev,
                songs: mergedSongs,
              } as T;
            }
            return result;
          });
        } else {
          setData(result);
        }
      } else {
        // First load or category change
        if (result && typeof result === "object" && "songs" in result) {
          allSongsRef.current = Array.isArray(result.songs) ? result.songs : [];
        }
        setData(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to load next playlist
  const loadNextPlaylist = useCallback(async (category: string) => {
    // Increment playlist index for this category
    const currentIndex =
      categoryIndices.current[
        category as keyof typeof categoryIndices.current
      ] || 0;
    const nextIndex =
      (currentIndex + 1) %
      (playlistUrls.current[category as keyof typeof playlistUrls.current]
        ?.length || 1);

    // Update the index for this category
    categoryIndices.current[category as keyof typeof categoryIndices.current] =
      nextIndex;

    // Set loading state for footer indicator
    setLoading(true);

    try {
      // Return the current category and index for the parent to use
      return {
        success: true,
        category,
        index: nextIndex,
        playlistUrl:
          playlistUrls.current[category as keyof typeof playlistUrls.current]?.[
            nextIndex
          ],
      };
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load more songs")
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
    allSongsRef.current = [];
    // Reset all category indices
    Object.keys(categoryIndices.current).forEach((key) => {
      categoryIndices.current[key as keyof typeof categoryIndices.current] = 0;
    });
  };

  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    // Always fetch on initial mount
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      fetchData();
      return;
    }
    fetchData();
  }, [...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    loadMore: loadNextPlaylist,
    reset,
    allSongs: allSongsRef.current,
    categoryIndices: categoryIndices.current,
  };
};

export default useFetch;
