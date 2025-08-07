import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SkeletonLoader = ({
  width = 100,
  height = 20,
  borderRadius = 0,
  style,
}) => {
  const opacityValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [opacityValue]);

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: "#3a3a3a",
          borderRadius,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: "#505050",
            opacity: opacityValue,
          },
        ]}
      />
    </View>
  );
};

const MusicImageSkeleton = () => {
  const imageSize = SCREEN_WIDTH * 0.8;
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}
    >
      <SkeletonLoader width={imageSize} height={imageSize} borderRadius={20} />
    </View>
  );
};

const TextSkeleton = ({ width = 100, height = 20, style }) => {
  return (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={10}
      style={[{ marginBottom: 8 }, style]}
    />
  );
};

const SongInfoSkeleton = () => {
  return (
    <View style={{ flex: 1, marginRight: 10 }}>
      <TextSkeleton width={SCREEN_WIDTH * 0.5} height={25} />
      <TextSkeleton width={SCREEN_WIDTH * 0.35} height={18} />
    </View>
  );
};

const FloatingParticles = ({ count = 3 }) => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            width: 4,
            height: 4,
            backgroundColor: "#505050",
            borderRadius: 2,
            left: `${20 + i * 25}%`,
            top: `${30 + i * 15}%`,
            opacity: 0.2,
          }}
        />
      ))}
    </View>
  );
};

export {
  SkeletonLoader,
  MusicImageSkeleton,
  TextSkeleton,
  SongInfoSkeleton,
  FloatingParticles,
};
