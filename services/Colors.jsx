import { useState } from "react";
import { getColors } from "react-native-image-colors";
export const getColorsForImage = async (image) => {
  try {
    const imageSource = image.uri;
    const cacheKey =
      typeof imageSource === "object" && imageSource.uri
        ? imageSource.uri
        : String(imageSource);
    const result = await getColors(imageSource, {
      fallback: "#333",
      cache: true,
      key: cacheKey,
    });
    return result;
  } catch (error) {
    console.log("Color error:", error);
    return null;
  }
};
