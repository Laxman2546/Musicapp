// contexts/PlayerContext.js
import React, { createContext, useState, useContext } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playSong = (song, songsList, index) => {
    setCurrentSong(song);
    setPlaylist(songsList);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const playNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSong(playlist[currentIndex + 1]);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentSong(playlist[currentIndex - 1]);
    }
  };
  console.log(currentSong);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        playlist,
        currentIndex,
        isPlaying,
        playSong,
        playNext,
        playPrevious,
        setIsPlaying,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
