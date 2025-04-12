import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect, useState, memo } from "react";
import { usePlayer } from "@/context/playerContext";
import { router } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import downloadIcon from "@/assets/images/downloadSong.png";
import checkedIcon from "@/assets/images/checked.png";
import defaultMusicImage from "@/assets/images/musicImage.png";

const downloadsDir = `${FileSystem.documentDirectory}downloads/`;

// Ensure directory exists
const ensureDirExists = async () => {
  const dir = await FileSystem.getInfoAsync(downloadsDir);
  if (!dir.exists) {
    await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
  }
};

const Trending = ({
  song,
  image,
  music,
  duration,
  primary_artists,
  song_url,
  index,
  allSongs,
  isdownloadedSongs,
}) => {
  const { playSong } = usePlayer();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const convertDuration = (duration) => {
    if (!duration) return "00:00";
    const min = Math.floor(duration / 60);
    const sec = Math.floor(duration % 60);
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  const getImageSource = (uri) =>
    typeof uri === "string" && uri.startsWith("http")
      ? { uri }
      : defaultMusicImage;

  const handlePlay = () => {
    const songObject = {
      song,
      image,
      music,
      duration,
      primary_artists,
      song_url,
    };

    const formattedList = allSongs.map((item, i) => ({
      song: item.song,
      image: item.image,
      music: item.music,
      duration: item.duration,
      primary_artists: item.primary_artists,
      song_url: item.media_url || item.music || item.filePath,
    }));

    playSong(songObject, formattedList, index);
    router.push("/player");
  };

  const checkIfAlreadyDownloaded = async () => {
    await ensureDirExists();
    const files = await FileSystem.readDirectoryAsync(downloadsDir);
    const name = song;
    const exists = files.some((file) => file.includes(name));
    setIsDownloaded(exists);
  };

  useEffect(() => {
    checkIfAlreadyDownloaded();
  }, []);

  const handleDownload = async () => {
    if (isDownloaded || isDownloading || !song_url) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);
      await ensureDirExists();

      if (permissionResponse?.status !== "granted") {
        const { status } = await requestPermission();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Media access is needed to save songs."
          );
          return;
        }
      }

      const filename = `${song}.mp3`;
      const filePath = `${downloadsDir}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        song_url,
        filePath,
        {},
        (progress) => {
          if (progress.totalBytesExpectedToWrite > 0) {
            const percent =
              progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
            setDownloadProgress(percent);
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result?.uri) throw new Error("Download failed");

      // Save to Media Library (Android)
      if (Platform.OS === "android") {
        const asset = await MediaLibrary.createAssetAsync(result.uri);
        await MediaLibrary.createAlbumAsync("Music Downloads", asset, false);
      }

      // Save metadata (JSON) next to file
      const metadata = {
        song,
        artist: primary_artists,
        duration,
        image,
        music,
        filePath: result.uri,
        downloadedAt: new Date().toISOString(),
      };

      const metaFile = `${downloadsDir}${filename.replace(".mp3", ".json")}`;
      await FileSystem.writeAsStringAsync(metaFile, JSON.stringify(metadata));
      console.log(metadata);
      setIsDownloaded(true);
      Alert.alert("Downloaded", "Song downloaded with metadata!");
    } catch (err) {
      console.log("Download Error:", err.message);
      Alert.alert("Error", "Failed to download song.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {song ? (
        <View className="w-full flex flex-row gap-6 bg-gray-100 rounded-2xl p-4 mb-2">
          <Image
            source={getImageSource(image)}
            defaultSource={defaultMusicImage}
            style={{ width: 60, height: 60, borderRadius: 10 }}
          />
          <View className="flex-1 justify-between">
            <TouchableOpacity onPress={handlePlay}>
              <Text
                numberOfLines={1}
                className="text-lg font-bold"
                style={{
                  fontFamily: "Nunito-Bold",
                }}
              >
                {song}
              </Text>
              <Text
                numberOfLines={1}
                className="text-sm text-gray-600"
                style={{
                  fontFamily: "Poppins-Regular",
                }}
              >
                {primary_artists || music}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Download Icon */}
          <View className="flex items-center gap-2">
            <TouchableOpacity onPress={handleDownload} disabled={isDownloaded}>
              {isDownloading ? (
                <View className="items-center">
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={{ fontSize: 10 }}>
                    {Math.round(downloadProgress * 100)}%
                  </Text>
                </View>
              ) : (
                <Image
                  source={
                    isDownloaded || isdownloadedSongs
                      ? checkedIcon
                      : downloadIcon
                  }
                  style={{ width: 24, height: 24 }}
                />
              )}
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  fontFamily: "Poppins-Regular",
                }}
              >
                {convertDuration(duration)}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="w-full h-full flex justify-center items-center pb-10">
          <Text
            style={{
              fontFamily: "Nunito-Bold",
              fontSize: 18,
            }}
          >
            No songs Found 😕
          </Text>
        </View>
      )}
    </>
  );
};

export default memo(Trending);

// <>
//   {song ? (
//     <View className="w-full flex flex-row gap-6 bg-gray-100 rounded-2xl p-4 mb-2">
//       <View>
//         <Image
//           source={getImageSource(image)}
//           defaultSource={require("../assets/images/musicImage.png")}
//           style={{
//             width: 60,
//             height: 60,
//             borderRadius: 10,
//           }}
//         />
//       </View>

//       <View className="flex flex-row justify-between align-middle w-3/4 relative">
//         <TouchableOpacity onPress={handleSong} hitSlop={10}>
//           <View>
//             <View className="SongName pr-7">
//               <Text
//                 numberOfLines={1}

//                 className="text-lg"
//               >
//                 {songName}
//               </Text>
//             </View>

//             <View className="pr-16">
//               <Text
//                 numberOfLines={1}

//               >
//                 {String(music || primary_artists || "...")}
//               </Text>
//             </View>
//           </View>
//         </TouchableOpacity>

//         <View className="flex gap-1 absolute right-2 items-center z-40">
//           <TouchableOpacity
//             onPress={handleDownload}
//             disabled={isDownloading}
//             hitSlop={10}
//           >
//             {isDownloading ? (
//               <Svg width={radius * 2} height={radius * 2}>
//                 <Circle
//                   stroke="#000"
//                   fill="transparent"
//                   strokeWidth={strokeWidth}
//                   strokeDasharray={circumference}
//                   strokeDashoffset={strokeDashoffset}
//                   cx={radius}
//                   cy={radius}
//                   r={radius - strokeWidth / 2}
//                 />
//               </Svg>
//             ) : (
//               <Image
//                 source={
//                   downloadedSongs || isdownloadedSongs
//                     ? checked
//                     : DownloadSong
//                 }
//                 style={{
//                   width: 25,
//                   height: 25,
//                 }}
//               />
//             )}
//           </TouchableOpacity>
//           <View>
//             <Text
//               style={{
//                 fontFamily: "Poppins-Regular",
//               }}
//             >
//               {convertDuration(duration)}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   ) : (
//
//   )}
// </>;
