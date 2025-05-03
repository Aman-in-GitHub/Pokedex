import { Audio } from "expo-av";
import { Image } from "expo-image";
import * as Speech from "expo-speech";
import { View, Text } from "react-native";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { createStyleSheet, useStyles } from "react-native-unistyles";

const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function Victory() {
  const { styles, theme } = useStyles(stylesheet);
  const [sound, setSound] = useState<Audio.Sound>();

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
      require("@/assets/sound/victory.mp3"),
    );

    setSound(sound);

    await sound.playAsync();
  }

  useFocusEffect(
    useCallback(() => {
      playSound();

      return () => {
        Speech.stop();
        sound?.unloadAsync();
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      <AnimatedImage
        style={{
          height: 150,
          width: 300,
        }}
        source={require("@/assets/images/pokemon.png")}
        transition={150}
        contentFit="contain"
        entering={FadeInDown.duration(500).springify()}
      />

      <AnimatedImage
        style={{
          height: 300,
          width: 200,
        }}
        source={require("@/assets/images/red.png")}
        transition={150}
        contentFit="contain"
        entering={FadeInDown.duration(500).springify().delay(150)}
      />

      <AnimatedImage
        style={{
          height: 200,
          width: 300,
        }}
        source={require("@/assets/images/badges.png")}
        transition={150}
        contentFit="contain"
        entering={FadeInDown.duration(500).springify().delay(300)}
      />

      <Animated.View entering={FadeInDown.duration(500).springify().delay(450)}>
        <Text
          style={{
            fontSize: 20,
            marginTop: 12,
            fontFamily: "Game",
            textAlign: "center",
            color: theme.colors.black,
          }}
        >
          Congratulations!
        </Text>
      </Animated.View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  container: {
    padding: 16,
    alignItems: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
}));
