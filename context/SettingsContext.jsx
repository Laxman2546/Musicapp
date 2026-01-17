import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
export const settingContext = createContext();
import userIcon from "@/assets/images/user.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

export const SettingsProvider = ({ children }) => {
  const [isInitials, setisInitials] = useState(false);
  const [showFallback, setShowfallback] = useState(false);
  const [username, setuserName] = useState("user");
  const [avatarnName, setAvatarnName] = useState("user18");
  useEffect(() => {
    const getAvatarType = async () => {
      try {
        const storedAvatarType = await AsyncStorage.getItem("avatarType");
        if (storedAvatarType !== null) {
          setisInitials(JSON.parse(storedAvatarType));
        }
      } catch (e) {
        console.log("Failed to load avatar type.", e);
      }
    };
    getAvatarType();
  }, []);

  useEffect(() => {
    const saveAvatarType = async () => {
      try {
        await AsyncStorage.setItem("avatarType", JSON.stringify(isInitials));
      } catch (error) {
        console.log("Failed to save avatar type.", error);
      }
    };
    saveAvatarType();
  }, [isInitials]);

  const getUser = async () => {
    const getuserName = await AsyncStorage.getItem("profileName");
    const getAvatarName = await AsyncStorage.getItem("avatar");
    if (
      getAvatarName === null ||
      !getAvatarName ||
      getAvatarName?.length <= 0
    ) {
      setAvatarnName("user18");
    } else {
      setAvatarnName(getAvatarName);
    }
    if (getuserName === null || !getuserName || getuserName?.length <= 0) {
      setuserName("user");
    } else {
      setuserName(getuserName);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUser();
    }, []),
  );
  return (
    <settingContext.Provider
      value={{
        isInitials,
        setisInitials,
        showFallback,
        setShowfallback,
        userIcon,
        username,
        avatarnName,
        setuserName,
        setAvatarnName,
      }}
    >
      {children}
    </settingContext.Provider>
  );
};

export const useSettings = () => useContext(settingContext);
