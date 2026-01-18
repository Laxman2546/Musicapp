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
  const [showRadio, setshowRadio] = useState(false);
  const [showRecently, setshowRecently] = useState(false);
  const [redirectDownloads, setRedirectDownloads] = useState(false);
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

  useEffect(() => {
    const loadAudioSettings = async () => {
      try {
        const radio = await AsyncStorage.getItem("showRadio");
        if (radio !== null) setshowRadio(JSON.parse(radio));

        const recently = await AsyncStorage.getItem("showRecently");
        if (recently !== null) setshowRecently(JSON.parse(recently));

        const redirect = await AsyncStorage.getItem("updateRedirect");
        if (redirect !== null) setRedirectDownloads(JSON.parse(redirect));
      } catch (e) {
        console.log("Failed to load settings", e);
      }
    };
    loadAudioSettings();
  }, []);
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
  const updateShowRadio = async (value) => {
    try {
      await AsyncStorage.setItem("showRadio", JSON.stringify(value));
    } catch (e) {
      console.log(e, "error while saving radio");
    }
  };
  const updateShowRecently = async (value) => {
    try {
      await AsyncStorage.setItem("showRecently", JSON.stringify(value));
    } catch (e) {
      console.log(e, "error while saving updateRedirect");
    }
  };
  const updateRedirect = async (value) => {
    try {
      await AsyncStorage.setItem("updateRedirect", JSON.stringify(value));
    } catch (e) {
      console.log(e, "error while saving radio");
    }
  };
  const handleShowRadio = useCallback(() => {
    const newValue = !showRadio;
    setshowRadio(newValue);
    updateShowRadio(newValue);
  }, [showRadio]);
  const handleShowRecently = useCallback(() => {
    const newValue = !showRecently;
    setshowRecently(newValue);
    updateShowRecently(newValue);
  }, [showRecently]);
    const handleRedirectDownloads = useCallback(() => {
      const newValue = !showRecently;
      setRedirectDownloads(newValue);
      updateRedirect(newValue);
    }, [showRecently]);
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
        handleShowRecently,
        showRecently,
        handleRedirectDownloads,
        redirectDownloads,
        userIcon,
        username,
        avatarnName,
        showRadio,
        handleShowRadio,
        setuserName,
        setAvatarnName,
      }}
    >
      {children}
    </settingContext.Provider>
  );
};

export const useSettings = () => useContext(settingContext);
