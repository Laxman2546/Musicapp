import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

let cachedDownloadsDir = null;

export const getDownloadsDirectory = async () => {
  if (cachedDownloadsDir) {
    return cachedDownloadsDir;
  }

  // Determine the base directory
  const baseDir =
    Platform.OS === "android"
      ? FileSystem.cacheDirectory
      : FileSystem.documentDirectory;

  if (!baseDir) {
    throw new Error("Unable to determine base directory for file storage");
  }

  const downloadsDir = `${baseDir}downloads/`;

  // Ensure the directory exists
  const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(downloadsDir, { intermediates: true });
  }

  cachedDownloadsDir = downloadsDir;
  return downloadsDir;
};

export const ensureDirExists = async () => {
  return await getDownloadsDirectory();
};
