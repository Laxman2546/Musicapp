import {
  Image,
  StyleSheet,
  Text,
  View,
  Animated,
  Pressable,
} from "react-native";
import musicImage from "@/assets/images/example.jpg";
import { useEffect, useState } from "react";
import ProgressBar from "react-native-progress/Bar";
import prevBtn from "@/assets/images/previousIcon.png";
import playIcon from "@/assets/images/playIcon.png";
import nextIcon from "@/assets/images/nextIcon.png";
import downloadIcon from "@/assets/images/downloadIcon2.png";
import ShuffleIcon from "@/assets/images/shuffle.png";
import loopFirst from "@/assets/images/repeatFirst.png";
import loopSecond from "@/assets/images/repeatSecond.png";
import Textticker from "react-native-text-ticker";
const musicPlayer = () => {
  const [shuffleActive, setShuffleActive] = useState(false);

  return (
    <>
      <View className="w-full h-full  mt-5 " style={styles.mainBg}>
        <View className="flex flex-col gap-12">
          <View className="flex flex-col gap-14">
            <View className="w-full flex  items-center mt-8">
              <Text style={styles.textFont}>Now Playing</Text>
            </View>
            <View className="w-full flex items-center justify-center">
              <Image source={musicImage} style={styles.musicImg} />
            </View>
          </View>
          <View
            className="w-full  flex flex-col bg-black h-full  p-5 pl-8 gap-3"
            style={styles.musicBg}
          >
            <View className="w-full  flex flex-col gap-1">
              <View className="w-full flex flex-row justify-between">
                <View>
                  <Textticker
                    style={{
                      fontSize: 18,
                      color: "white",
                      backgroundColor: "black",
                    }}
                    duration={5000} // Adjust speed
                    loop
                    bounce
                    repeatSpacer={50} // Space between loops
                    marqueeDelay={1000} // Delay before start
                  >
                    <Text style={styles.musicText} className="text-white">
                      Pain
                    </Text>
                  </Textticker>
                  <Text style={styles.musicArtist} className="text-white">
                    Ryan Jones
                  </Text>
                </View>
                <View className="w-16 h-14 p-2  items-center justify-center rounded-2xl bg-[#2B2B2B]">
                  <Image source={downloadIcon} style={styles.downloadSize} />
                </View>
              </View>
            </View>
            <View className="w-full flex items-center flex-col">
              <ProgressBar
                progress={0.2}
                height={8}
                width={310}
                borderRadius={25}
                color={"#fff"}
                backgroundColor={"#3O3O3O"}
                borderColor={"#303030"}
                style={styles.progressBar}
              />
              <View className="flex flex-row justify-between w-full">
                <Text style={styles.textFont}>02:00</Text>
                <Text style={styles.textFont}>05:00</Text>
              </View>
              <View className="flex flex-row items-center justify-between w-full">
                <Pressable
                  onPress={() => {
                    setShuffleActive((prev) => !prev);
                  }}
                >
                  <View
                    className="w-10 h-10 p-2  items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: shuffleActive === true ? "#2C2C2C" : "",
                      borderRadius: shuffleActive === true ? 50 : "",
                    }}
                  >
                    <Image source={ShuffleIcon} style={styles.downloadSize} />
                  </View>
                </Pressable>
                <View className="flex flex-row items-center gap-9 align-middle justify-center">
                  <Image source={prevBtn} style={styles.iconsSize} />
                  <View className="w-16 h-14 p-2  items-center justify-center rounded-xl bg-[#2C2C2C]">
                    <Image source={playIcon} style={styles.PlaySize} />
                  </View>
                  <Image source={nextIcon} style={styles.iconsSize} />
                </View>
                <View>
                  <Image source={loopFirst} style={styles.downloadSize} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default musicPlayer;

const styles = StyleSheet.create({
  textFont: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    color: "#fff",
  },
  mainBg: {
    backgroundColor: "#2A2A2A",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  musicBg: {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
  },
  musicImg: {
    width: 250,
    height: 250,
    borderRadius: 20,
  },
  musicText: {
    fontFamily: "Nunito-Black",
    fontSize: 20,
    color: "#fff",
  },
  musicArtist: {
    fontFamily: "Nunito-Regular",
    fontSize: 20,
    color: "#fff",
  },
  progressBar: {
    color: "#fff",
  },
  iconsSize: {
    width: 30,
    height: 30,
  },
  PlaySize: {
    width: 20,
    height: 20,
    backgroundColor: "#2B2B2B",
  },
  downloadSize: {
    width: 20,
    height: 20,
  },
});
