import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { SvgUri } from "react-native-svg";
import { ChevronRight, RefreshCcw } from "lucide-react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSettings } from "@/context/SettingsContext";
import ToggleSwitch from "toggle-switch-react-native";
import love from "@/assets/images/madeimg.png";
import { usePlayer } from "@/context/playerContext";
import { checkForUpdates } from "@/services/Checkupdates";

const SettingItem = ({ title, description, isOn, onToggle }) => (
  <View style={styles.settingItem}>
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDescription}>{description}</Text>
    </View>
    <ToggleSwitch
      isOn={isOn}
      onColor="#3b82f6"
      offColor="#9ca3af"
      size="small"
      onToggle={onToggle}
    />
  </View>
);

const Settings = () => {
  const handleBack = () => {
    router.back();
  };

  const {
    showFallback,
    setShowfallback,
    userIcon,
    showRadio,
    handleShowRadio,
    showRecently,
    handleShowRecently,
    redirectDownloads,
    handleRedirectDownloads,
    isInitials,
    username,
    avatarnName,
  } = useSettings();

  const {
    showVolume,
    handleShowVolume,
    shuffleToggle,
    toggleShuffle,
    showSongLyrics,
    handleShowSongLyrics,
  } = usePlayer();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={25} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Pressable
            style={styles.profileCard}
            onPress={() => router.push("/editProfile")}
          >
            <View style={styles.avatarContainer}>
              {showFallback ? (
                <Image
                  source={userIcon}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <SvgUri
                  width="56"
                  height="56"
                  uri={
                    isInitials
                      ? `https://api.dicebear.com/9.x/initials/svg?seed=${username}&radius=50&backgroundType=solid&chars=1`
                      : `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${avatarnName}&radius=50&eyes=closed,closed2,cute,glasses,pissed,plain,shades,wink2,wink&mouth=cute,drip,shout,wideSmile,smileTeeth,smileLol`
                  }
                  onError={() => setShowfallback(true)}
                />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.username}>{username}</Text>
              <View style={styles.editButton}>
                <Text style={styles.editText}>Edit profile</Text>
                <ChevronRight size={16} color="#3b82f6" />
              </View>
            </View>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>
          <View style={styles.card}>
            <SettingItem
              title="Always Shuffle Songs"
              description="Play random songs every time"
              isOn={shuffleToggle}
              onToggle={toggleShuffle}
            />
            <View style={styles.divider} />
            <SettingItem
              title="Show Volume Controls"
              description="Display volume slider in player"
              isOn={showVolume}
              onToggle={handleShowVolume}
            />
            <View style={styles.divider} />
            <SettingItem
              title="Hide Lyrics Button"
              description="Remove lyrics to enhance performance"
              isOn={showSongLyrics}
              onToggle={handleShowSongLyrics}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.card}>
            <SettingItem
              title="Hide Live Radio"
              description="Remove radio section from home"
              isOn={showRadio}
              onToggle={handleShowRadio}
            />
            <View style={styles.divider} />
            <SettingItem
              title="Hide Recently Released"
              description="Remove new releases from home"
              isOn={showRecently}
              onToggle={handleShowRecently}
            />
            <View style={styles.divider} />
            <SettingItem
              title="Open Downloads Offline"
              description="Redirect to downloads when offline"
              isOn={redirectDownloads}
              onToggle={handleRedirectDownloads}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Pressable onPress={() => checkForUpdates(true)}>
            <View style={styles.updateCard}>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>Check for Updates</Text>
                <Text style={styles.updateDescription}>
                  See if a new version is available
                </Text>
              </View>
              <RefreshCcw size={24} color="#3b82f6" />
            </View>
          </Pressable>
        </View>

        <View style={styles.githubSection}>
          <AntDesign name="star" size={20} color="#ffc000" />
          <Text style={styles.githubText}>Star it on </Text>
          <Pressable
            onPress={() =>
              Linking.openURL("https://github.com/Laxman2546/Musicapp")
            }
          >
            <Text style={styles.githubLink}>GitHub</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Image
            source={love}
            style={styles.footerImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 24,
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  username: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "#111827",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  editText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: "#3b82f6",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 4,
  },
  updateCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  updateContent: {
    flex: 1,
    gap: 4,
  },
  updateTitle: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#111827",
  },
  updateDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "#6b7280",
  },
  githubSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginVertical: 24,
  },
  githubText: {
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    color: "#374151",
  },
  githubLink: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    marginTop: 5,
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
  },
  footerImage: {
    width: "100%",
    height: 200,
  },
});
