import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";

let cachedDownloadsDir = null;

export const getDownloadsDirectory = async () => {
  if (cachedDownloadsDir) {
    return cachedDownloadsDir;
  }

  let downloadsDir;

  if (Platform.OS === "android") {
    try {
      // Request media library permissions instead of SAF
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Media library permission not granted");
      }

      // Use app-specific external directory
      downloadsDir = `${FileSystem.documentDirectory}nanimusic/`;

      try {
        const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(downloadsDir, {
            intermediates: true,
          });
        }

        // Ensure the .nomedia file exists to prevent media scanning
        const noMediaPath = `${downloadsDir}.nomedia`;
        const noMediaInfo = await FileSystem.getInfoAsync(noMediaPath);
        if (!noMediaInfo.exists) {
          await FileSystem.writeAsStringAsync(noMediaPath, "");
        }
      } catch (error) {
        console.log("Error creating NaniMusic directory:", error);
        throw new Error("Failed to create music directory");
      }
    } catch (error) {
      console.log("Error accessing storage:", error);
      // Fallback to internal storage
      downloadsDir = `${FileSystem.documentDirectory}downloads/`;
      const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(downloadsDir, {
          intermediates: true,
        });
      }
    }
  } else {
    // For iOS, continue using documentDirectory
    downloadsDir = `${FileSystem.documentDirectory}downloads/`;
    const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadsDir, {
        intermediates: true,
      });
    }
  }

  cachedDownloadsDir = downloadsDir;
  return downloadsDir;
};

export const ensureDirExists = async () => {
  return await getDownloadsDirectory();
};
