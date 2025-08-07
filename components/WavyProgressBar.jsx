import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, PanResponder } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BAR_HEIGHT = 8;
const WAVE_AMPLITUDE = 4;
const WAVE_FREQUENCY = 2;
const WAVE_SPEED = 2000;
const BALL_RADIUS = 8;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const WavyProgressBar = ({
  progress = 0,
  isPlaying = false,
  minimumTrackTintColor = "#FFFFFF",
  maximumTrackTintColor = "#303030",
  style,
  onSlidingComplete,
}) => {
  const phase = useSharedValue(0);
  const internalProgress = useSharedValue(progress);

  useEffect(() => {
    internalProgress.value = progress;
  }, [progress]);

  useEffect(() => {
    if (isPlaying) {
      phase.value = withRepeat(
        withTiming(-Math.PI * 2, {
          duration: WAVE_SPEED,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      phase.value = withTiming(0, { duration: 300 });
    }
  }, [isPlaying]);

  const animatedProps = useAnimatedProps(() => {
    const waveWidth = SCREEN_WIDTH * internalProgress.value;
    const step = 10;
    let path = `M 0 ${BAR_HEIGHT / 2} `;

    for (let x = 0; x <= waveWidth; x += step) {
      const y =
        Math.sin((x / 40) * WAVE_FREQUENCY + phase.value) * WAVE_AMPLITUDE +
        BAR_HEIGHT / 2;
      path += `L ${x} ${y} `;
    }

    path += `L ${waveWidth} ${BAR_HEIGHT} L 0 ${BAR_HEIGHT} Z`;
    return { d: path };
  });

  const ballStyle = useAnimatedStyle(() => {
    const x = SCREEN_WIDTH * internalProgress.value;
    return {
      transform: [{ translateX: x - BALL_RADIUS }, { translateY: 0 }],
    };
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const x = evt.nativeEvent.locationX;
      updateProgressFromX(x);
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX;
      updateProgressFromX(x);
    },
    onPanResponderRelease: () => {
      if (onSlidingComplete) onSlidingComplete(internalProgress.value);
    },
  });

  const updateProgressFromX = (x) => {
    const clampedX = Math.max(0, Math.min(SCREEN_WIDTH, x));
    const newProgress = clampedX / SCREEN_WIDTH;
    internalProgress.value = newProgress;
  };

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      <View
        style={[styles.background, { backgroundColor: maximumTrackTintColor }]}
      />
      <Svg
        height={BAR_HEIGHT}
        width={SCREEN_WIDTH * progress}
        style={styles.waveContainer}
      >
        <AnimatedPath
          animatedProps={animatedProps}
          fill={minimumTrackTintColor}
        />
      </Svg>
      <Animated.View style={[styles.ball, ballStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 10,
    width: "100%",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
  },
  waveContainer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  ball: {
    position: "absolute",
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    borderRadius: BALL_RADIUS,
    backgroundColor: "#fff",
    top: (BAR_HEIGHT - BALL_RADIUS * 2) / 2 + 4,
    zIndex: 2,
  },
});

export default WavyProgressBar;
