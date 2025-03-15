export const MUSIC_CONFIG = {
  BASE_URL: "https://nanimusciapi.vercel.app",
};

export const fetchMusic = async ({ query }) => {
  const endpoint = query
    ? `${MUSIC_CONFIG.BASE_URL}/result/?query=${encodeURIComponent(query)}`
    : `${MUSIC_CONFIG.BASE_URL}/playlist/?query=https://www.jiosaavn.com/s/playlist/phulki_user/Now_Trending_-_Telugu/vid44GJ,K8FieSJqt9HmOQ__`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("something went wrong tryagain! 😢", response.statusText);
  }
  const data = await response.json();
  return data;
};
