import { Alert } from "react-native";
import * as Updates from "expo-updates";

export const checkForUpdates = async (isClicked = false) => {
  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      Alert.alert(
        "Update Available",
        "A new version is available. Would you like to update now?",
        [
          {
            text: "Later",
            style: "cancel",
          },
          {
            text: "Update",
            onPress: async () => {
              try {
                await Updates.fetchUpdateAsync();
                Alert.alert(
                  "Update Ready",
                  "The update has been downloaded. The app will now restart.",
                  [
                    {
                      text: "OK",
                      onPress: async () => {
                        await Updates.reloadAsync();
                      },
                    },
                  ]
                );
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Failed to download the update. Please try again later."
                );
              }
            },
          },
        ]
      );
    } else {
      if (isClicked) {
        Alert.alert("No Updates", "You're running the latest version!");
      }
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
    if (isClicked) {
      Alert.alert(
        "Error",
        "Failed to check for updates. Please try again later."
      );
    }
  }
};