export const MUSIC_CONFIG = {
  BASE_URL: "https://nanimusciapi.vercel.app",
  PLAYLISTS: {
    Trending: [
      "https://www.jiosaavn.com/s/playlist/phulki_user/Now_Trending_-_Telugu/vid44GJ,K8FieSJqt9HmOQ__",
      "https://www.jiosaavn.com/featured/chartbusters-2021-telugu/2qpkPLvd3ZuO0eMLZZxqsA__",
    ],
    Popular: [
      "https://www.jiosaavn.com/featured/telugu-top-hits/O3HGftTHl-puOxiEGmm6lQ__",
      "https://www.jiosaavn.com/featured/telugu-2000s/YT46Krlbc76N8OQeUngFdA__",
    ],
    Recent: [
      "https://www.jiosaavn.com/featured/kotha-tunes/bDjUXq26B5Y_",
      "https://www.jiosaavn.com/featured/telugu-india-superhits-top-50/4O6DwO-qteN613W6L-cCSw__",
    ],
  },
};

// Tracking playlist indices
const playlistIndices = {
  Trending: 0,
  Popular: 0,
  Recent: 0,
};

export const fetchMusic = async ({
  query = "",
  active = "Trending",
  nextPlaylist = false,
}) => {
  let endpoint;

  // If nextPlaylist is true, rotate to the next playlist for this category
  if (nextPlaylist && active) {
    const currentIndex = playlistIndices[active];
    const playlists = MUSIC_CONFIG.PLAYLISTS[active];

    if (playlists && playlists.length > 0) {
      // Move to next playlist index (circular)
      playlistIndices[active] = (currentIndex + 1) % playlists.length;
      const nextPlaylistUrl = playlists[playlistIndices[active]];

      endpoint = `${MUSIC_CONFIG.BASE_URL}/playlist/?query=${encodeURIComponent(
        nextPlaylistUrl
      )}`;
    }
  } else if (query) {
    endpoint = `${MUSIC_CONFIG.BASE_URL}/result/?query=${query}`;
  } else if (active === "Trending") {
    const playlistUrl =
      MUSIC_CONFIG.PLAYLISTS.Trending[playlistIndices.Trending];
    endpoint = `${MUSIC_CONFIG.BASE_URL}/playlist/?query=${encodeURIComponent(
      playlistUrl
    )}`;
  } else if (active === "Popular") {
    const playlistUrl = MUSIC_CONFIG.PLAYLISTS.Popular[playlistIndices.Popular];
    endpoint = `${MUSIC_CONFIG.BASE_URL}/playlist/?query=${encodeURIComponent(
      playlistUrl
    )}`;
  } else {
    const playlistUrl = MUSIC_CONFIG.PLAYLISTS.Recent[playlistIndices.Recent];
    endpoint = `${MUSIC_CONFIG.BASE_URL}/playlist/?query=${encodeURIComponent(
      playlistUrl
    )}`;
  }

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching music:", error);
    throw error;
  }
};

// Helper function to get the next playlist
export const getNextPlaylist = async (active) => {
  return await fetchMusic({ active, nextPlaylist: true });
};
