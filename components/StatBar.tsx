import Animated, {
  FadeInDown,
  withTiming,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Text } from "react-native";
import React, { useEffect } from "react";

import { lightenColor } from "@/lib/utils";
import { MAX_STAT_VALUE } from "@/lib/constants";

type StatBarProps = {
  label: string;
  color: string;
  value: number;
  index: number;
};

export default function StatBar({ label, color, value, index }: StatBarProps) {
  const progress = useSharedValue(0);

  const percentage = (value / MAX_STAT_VALUE) * 100;

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 1000 });
  }, [percentage, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
      position: "absolute",
      height: 100,
      backgroundColor: lightenColor(color, 0.3),
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: "100%",
          borderRadius: 12,
          paddingVertical: 14,
          backgroundColor: lightenColor(color, 0.05),
          position: "relative",
          overflow: "hidden",
        },
      ]}
      entering={FadeInDown.duration(500)
        .delay(index * 100)
        .springify()}
    >
      <Animated.View style={animatedStyle} />

      <Text
        style={{
          fontFamily: "Game",
          color: color,
          fontSize: 12,
          zIndex: 1000,
          paddingHorizontal: 16,
        }}
      >
        {label}: {value}
      </Text>
    </Animated.View>
  );
}
