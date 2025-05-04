import CryptoJS from "crypto-js";

const JIOSAAVN_ENDPOINTS = {
  search: "https://jiosaavn-api-sigma-rouge.vercel.app/api/search/songs?query=",
  songDetails:
    "https://www.jiosaavn.com/api.php?__call=song.getDetails&cc=in&_marker=0%3F_marker%3D0&_format=json&pids=",
  albumDetails:
    "https://www.jiosaavn.com/api.php?__call=content.getAlbumDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&albumid=",
  playlistDetails:
    "https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&_marker=0%3F_marker%3D0&listid=",
  lyrics:
    "https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&ctx=web6dot0&api_version=4&_format=json&_marker=0%3F_marker%3D0&lyrics_id=",
};

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.jiosaavn.com",
  Referer: "https://www.jiosaavn.com/",
};

const KEY = "38346591";
const DES_IV = "00000000";

export const decryptUrl = (encrypted) => {
  if (!encrypted) return "";

  try {
    // Convert the key and IV to WordArray
    const keyWords = CryptoJS.enc.Utf8.parse(KEY);
    const iv = CryptoJS.enc.Utf8.parse(DES_IV);

    // Decode base64
    const ciphertext = CryptoJS.enc.Base64.parse(encrypted);

    // Decrypt
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: ciphertext },
      keyWords,
      {
        iv: iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    // Convert to string and replace quality
    const decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedUrl.replace("_96.mp4", "_320.mp4");
  } catch (error) {
    console.error("Error decrypting URL:", error);
    return "";
  }
};

const formatSong = (data) => {
  try {
    // Decrypt media URL
    const mediaUrl = decryptUrl(data.encrypted_media_url);

    // Format the song data
    return {
      id: data.id,
      song: data.song,
      album: data.album,
      year: data.year,
      primary_artists: data.primary_artists,
      singers: data.singers,
      image: data.image.replace("150x150", "500x500"),
      duration: data.duration,
      media_url: mediaUrl,
      media_preview_url: mediaUrl
        ?.replace("_320.mp4", "_96_p.mp4")
        ?.replace("//aac.", "//preview."),
      has_lyrics: data.has_lyrics,
      lyrics: null, // Can be fetched separately if needed
      copyright_text: data.copyright_text,
      label: data.label,
      labelUrl: data.label_url,
      language: data.language,
      perma_url: data.perma_url,
      release_date: data.release_date,
    };
  } catch (error) {
    console.error("Error formatting song:", error);
    return data;
  }
};

// Clean JSONP response
const cleanResponse = async (response) => {
  try {
    const text = await response.text();
    const cleanText = text.replace(/^[^{]*?({.*})[^}]*$/, "$1");
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error cleaning response:", error);
    throw error;
  }
};

export const searchSongs = async (query) => {
  try {
    const response = await fetch(
      `${JIOSAAVN_ENDPOINTS.search}${encodeURIComponent(query)}`
    );
    const Jsondata = await response.json();
    return Jsondata.data;
  } catch (error) {
    console.error("Error searching songs:", error);
    throw error;
  }
};

export const getSongDetails = async (id) => {
  try {
    const response = await fetch(`${JIOSAAVN_ENDPOINTS.songDetails}${id}`, {
      headers: HEADERS,
    });

    const data = await cleanResponse(response);
    return formatSong(data[id]);
  } catch (error) {
    console.error("Error getting song details:", error);
    throw error;
  }
};

export const getPlaylistDetails = async (listId) => {
  try {
    const response = await fetch(
      `${JIOSAAVN_ENDPOINTS.playlistDetails}${listId}`,
      {
        headers: HEADERS,
      }
    );

    const data = await cleanResponse(response);
    return {
      ...data,
      songs: data.songs.map(formatSong),
    };
  } catch (error) {
    console.error("Error getting playlist details:", error);
    throw error;
  }
};

export const getPlaylistFromUrl = async (url) => {
  try {
    const response = await fetch(url, {
      headers: HEADERS,
      method: "GET",
    });

    const html = await response.text();
    const playlistId =
      html.match(/"type":"playlist","id":"([^"]+)"/)?.[1] ||
      html.match(/"page_id","([^"]+)"/)?.[1];

    if (!playlistId) throw new Error("Could not extract playlist ID");

    return await getPlaylistDetails(playlistId);
  } catch (error) {
    console.error("Error getting playlist from URL:", error);
    throw error;
  }
};

// Updated configuration with added categories
export const MUSIC_CONFIG = {
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
    English: [
      "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/englishplaylist/RoybTvNFqtXgEhiRleA1SQ__",
    ],
    Hindi: [
      "https://www.jiosaavn.com/featured/hindi-hit-songs/ZodsPn39CSjwxP8tCU-flw__",
      "https://www.jiosaavn.com/featured/monthly-top-100-hindi/PZaVnbecD1rfemJ68FuXsA__",
    ],
  },
};

// Tracking playlist indices
const playlistIndices = {
  Trending: 0,
  Popular: 0,
  Recent: 0,
  English: 0,
  Hindi: 0,
};

// Direct JioSaavn API implementation
export const fetchMusic = async ({
  query = "",
  active = "Trending",
  premaUrl = "",
  nextPlaylist = false,
}) => {
  try {
    if (query) {
      return await searchSongs(query);
    }

    // Handle next playlist request
    if (nextPlaylist && active) {
      const currentIndex = playlistIndices[active];
      const playlists = MUSIC_CONFIG.PLAYLISTS[active];

      if (playlists && playlists.length > 0) {
        playlistIndices[active] = (currentIndex + 1) % playlists.length;
        const nextPlaylistUrl = playlists[playlistIndices[active]];
        return await getPlaylistFromUrl(nextPlaylistUrl);
      }
    }
    if (premaUrl) {
      return await getPlaylistFromUrl(premaUrl);
    }
    if (MUSIC_CONFIG.PLAYLISTS[active]) {
      const playlistUrl =
        MUSIC_CONFIG.PLAYLISTS[active][playlistIndices[active]];
      return await getPlaylistFromUrl(playlistUrl);
    }
    const defaultPlaylistUrl =
      MUSIC_CONFIG.PLAYLISTS.Trending[playlistIndices.Trending];
    return await getPlaylistFromUrl(defaultPlaylistUrl);
  } catch (error) {
    console.error("Error fetching music:", error);
    throw error;
  }
};

export const getNextPlaylist = async (active) => {
  return await fetchMusic({ active, nextPlaylist: true });
};
