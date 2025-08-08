import { useState, useEffect, useMemo } from "react";
import { useProgress } from "react-native-track-player";

export default function useSyncedLyrics(rawLyrics) {
  const { position } = useProgress(0.05);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Parse LRC format lyrics
  const parsedLyrics = useMemo(() => {
    if (!rawLyrics || typeof rawLyrics !== "string") return [];

    return rawLyrics
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const match = line.match(
          /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]\s*(.*)/
        );
        if (!match) return null;

        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = match[3]
          ? parseInt(match[3].padEnd(3, "0"), 10)
          : 0;
        const text = match[4].trim() || "♪";

        return {
          time: minutes * 60 + seconds + milliseconds / 1000,
          text,
          minutes,
          seconds,
          milliseconds,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);
  }, [rawLyrics]);

  useEffect(() => {
    if (!parsedLyrics.length) {
      setCurrentLineIndex(0);
      return;
    }

    for (let i = parsedLyrics.length - 1; i >= 0; i--) {
      if (position >= parsedLyrics[i].time) {
        if (i !== currentLineIndex) {
          setCurrentLineIndex(i);
        }
        break;
      }
    }
  }, [position, parsedLyrics, currentLineIndex]);

  return {
    lyrics: parsedLyrics,
    currentIndex: currentLineIndex,
    currentLine: parsedLyrics[currentLineIndex] || { text: "", time: 0 },
    hasLyrics: parsedLyrics.length > 0,
  };
}
