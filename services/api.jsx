export const MUSIC_CONFIG = {
  BASE_URL: "https://nanimusciapi.vercel.app",
};

export const fetchMusic = async ({ query, active }) => {
  const endpoint = query
    ? `${MUSIC_CONFIG.BASE_URL}/result/?query=${encodeURIComponent(query)}`
    : active === "Trending"
    ? `${MUSIC_CONFIG.BASE_URL}/playlist/?query=https://www.jiosaavn.com/s/playlist/phulki_user/Now_Trending_-_Telugu/vid44GJ,K8FieSJqt9HmOQ__`
    : active === "Popular"
    ? `${MUSIC_CONFIG.BASE_URL}/playlist/?query=https://www.jiosaavn.com/featured/telugu-top-hits/O3HGftTHl-puOxiEGmm6lQ__`
    : `${MUSIC_CONFIG.BASE_URL}/playlist/?query=https://www.jiosaavn.com/featured/kotha-tunes/bDjUXq26B5Y_`;

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
