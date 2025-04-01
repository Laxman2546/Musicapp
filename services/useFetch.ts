import { useEffect, useState, useRef, useCallback } from "react";
import { MUSIC_CONFIG } from "@/services/api";

type CategoryIndices = {
  All: number;
  Trending: number;
  Popular: number;
  Recent: number;
  VenkateshwaraSwamy: number;
  Shiva: number;
  DurgaDevi: number;
  Ganesha: number;
  SaiBaba: number;
  Hanuman: number;
};

const useFetch = <T extends { songs?: any[] }>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFunctionRef = useRef(fetchFunction);
  const initialLoadRef = useRef(true);


  const allSongsRef = useRef<any[]>([]);


  const categoryIndices = useRef<CategoryIndices>({
    All: 0,
    Trending: 0,
    Popular: 0,
    Recent: 0,
    VenkateshwaraSwamy: 0,
    Shiva: 0,
    DurgaDevi: 0,
    Ganesha: 0,
    SaiBaba: 0,
    Hanuman: 0,
  });

  const playlistUrls = useRef(MUSIC_CONFIG.PLAYLISTS);
  const activeBhakthiRef = useRef("VenkateshwaraSwamy");

  // Reset data when dependencies change
  useEffect(() => {
    if (!initialLoadRef.current) {
      allSongsRef.current = [];

      // Update active Bhakthi category if provided in dependencies
      if (dependencies.length >= 2) {
        const [activeCategory, bhakthiCategory] = dependencies;
        if (activeCategory === "Bhakthi" && bhakthiCategory) {
          activeBhakthiRef.current = bhakthiCategory;
          // Reset index when Bhakthi subcategory changes
          categoryIndices.current[bhakthiCategory as keyof CategoryIndices] = 0;
        }
      }
    }
  }, [...dependencies]);

  const fetchData = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) setLoading(true);
      setError(null);

      const result = await fetchFunctionRef.current();

      if (result?.songs) {
        if (loadMore) {
          // Merge new songs avoiding duplicates
          const existingSongs = new Set(
            allSongsRef.current.map((song) => song.song)
          );
          const uniqueNewSongs = result.songs.filter(
            (song) => !existingSongs.has(song.song)
          );
          allSongsRef.current = [...allSongsRef.current, ...uniqueNewSongs];

          setData(
            (prev) =>
              ({
                ...(prev || {}),
                songs: allSongsRef.current,
              } as T)
          );
        } else {
          allSongsRef.current = result.songs;
          setData(result);
        }
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadNextPlaylist = useCallback(async (category: string) => {
    const actualCategory =
      category === "Bhakthi" ? activeBhakthiRef.current : category;

    if (
      !playlistUrls.current[actualCategory as keyof typeof playlistUrls.current]
    ) {
      console.error(`No playlists configured for ${actualCategory}`);
      return { success: false };
    }

    const currentIndex =
      categoryIndices.current[actualCategory as keyof CategoryIndices] || 0;
    const playlists =
      playlistUrls.current[actualCategory as keyof typeof playlistUrls.current];
    const nextIndex = (currentIndex + 1) % playlists.length;

    categoryIndices.current[actualCategory as keyof CategoryIndices] =
      nextIndex;
    setLoading(true);

    try {
      return {
        success: true,
        category: actualCategory,
        index: nextIndex,
        playlistUrl: playlists[nextIndex],
        bhakthiCategory:
          category === "Bhakthi" ? activeBhakthiRef.current : undefined,
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

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    allSongsRef.current = [];
    Object.keys(categoryIndices.current).forEach((key) => {
      categoryIndices.current[key as keyof CategoryIndices] = 0;
    });
  }, []);

  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      fetchData();
      return;
    }

    // Update active Bhakthi if in dependencies
    if (dependencies.length >= 2) {
      const [activeCategory, bhakthiCategory] = dependencies;
      if (activeCategory === "Bhakthi" && bhakthiCategory) {
        activeBhakthiRef.current = bhakthiCategory;
      }
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
    activeBhakthi: activeBhakthiRef.current,
  };
};

export default useFetch;
