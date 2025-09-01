import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

let cachedDownloadsDir = null;

export const getDownloadsDirectory = async () => {
  if (cachedDownloadsDir) {
    return cachedDownloadsDir;
  }

  let downloadsDir;

  if (Platform.OS === "android") {
    try {
      // For Android, always try to get persistent storage access
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        // Store the granted URI for future use
        downloadsDir = permissions.directoryUri;

        try {
          // Try to find existing NaniMusic directory
          const existingDirs =
            await FileSystem.StorageAccessFramework.readDirectoryAsync(
              downloadsDir
            );
          const naniMusicDir = existingDirs.find((uri) =>
            uri.includes("NaniMusic")
          );

          if (naniMusicDir) {
            downloadsDir = naniMusicDir;
          } else {
            // Create new NaniMusic directory if it doesn't exist
            const newDir =
              await FileSystem.StorageAccessFramework.createDirectoryAsync(
                downloadsDir,
                "NaniMusic",
                false
              );
            downloadsDir = newDir;
          }
        } catch (error) {
          console.log("Error with NaniMusic directory:", error);
          throw new Error("Failed to access or create NaniMusic directory");
        }
      } else {
        throw new Error("Storage permission not granted");
      }
    } catch (error) {
      console.log("Error accessing storage:", error);
      // Fallback to documents directory if permission not granted
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
