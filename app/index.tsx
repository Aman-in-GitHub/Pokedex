import Animated, {
  useAnimatedProps,
  useSharedValue,
  interpolate,
  Extrapolation,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import {
  Camera,
  useCameraDevice,
  CameraProps,
  CameraDevice,
} from "react-native-vision-camera";
import { eq } from "drizzle-orm";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useAudioPlayer } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Pressable, Text, ToastAndroid, Vibration, View } from "react-native";

import { db } from "@/db";
import * as schema from "@/db/schema/index";
import GalleryIcon from "@/assets/icons/Gallery.svg";
import { savePokemonToDex, verifyWithPokedex } from "@/lib/utils";
import { TEMP_DIRECTORY } from "@/lib/constants";

Animated.addWhitelistedNativeProps({
  zoom: true,
});
const AnimatedCamera = Animated.createAnimatedComponent(Camera);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Index() {
  const { styles, theme } = useStyles(stylesheet);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice("back") as CameraDevice;
  const zoom = useSharedValue(device.neutralZoom);
  const [isCatching, setIsCatching] = useState(false);
  const catchPlayer = useAudioPlayer(require("@/assets/sound/catch.mp3"));
  const runawayPlayer = useAudioPlayer(require("@/assets/sound/runaway.mp3"));

  const pokeballScale = useSharedValue(1);

  const pokeballAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pokeballScale.value }],
    };
  });

  const zoomOffset = useSharedValue(0);
  const gesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value;
    })
    .onUpdate((event) => {
      const z = zoomOffset.value * event.scale;
      zoom.value = interpolate(
        z,
        [1, 10],
        [device.minZoom, device.maxZoom],
        Extrapolation.CLAMP,
      );
    });

  const animatedProps = useAnimatedProps<CameraProps>(
    () => ({ zoom: zoom.value }),
    [zoom],
  );

  async function capturePokemon() {
    if (!cameraRef.current) {
      return;
    }

    setIsCatching(true);

    const photo = await cameraRef.current.takePhoto();

    catchPlayer.seekTo(0);
    catchPlayer.play();

    try {
      const tempPath = await savePokemonToDex(photo.path, TEMP_DIRECTORY);

      const res = await verifyWithPokedex(tempPath || "");

      if (
        !res ||
        res.message[0].dexNumber === "undefined" ||
        res.message[0].name === "undefined"
      ) {
        runawayPlayer.seekTo(0);
        runawayPlayer.play();

        ToastAndroid.show(
          "No info about this Pokémon, Try again",
          ToastAndroid.SHORT,
        );
        return;
      }

      const isShiny = Math.floor(Math.random() * 1024) + 1 === 1024;

      const pokemon = await db
        .select()
        .from(schema.pokemons)
        .where(eq(schema.pokemons.id, parseInt(res.message[0].dexNumber)));

      router.navigate({
        pathname: "/caught",
        params: {
          item: JSON.stringify(pokemon),
          shinyStatus: JSON.stringify(isShiny),
          tempCaughtImage: tempPath,
        },
      });
    } catch (error) {
      ToastAndroid.show("Error capturing Pokémon", ToastAndroid.SHORT);
      console.error("Error saving photo:", error);
    } finally {
      setIsCatching(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" animated={true} translucent={true} />

      <View
        style={{
          gap: 12,
          marginTop: 32,
          flexDirection: "row",
        }}
      >
        <View
          style={[
            {
              height: 70,
              width: 70,
              borderRadius: 1000,
              position: "relative",
              backgroundColor: "white",
            },
            styles.shadow,
          ]}
        >
          <Image
            style={{
              height: 80,
              width: 80,
              position: "absolute",
              top: -7,
              left: -7,
            }}
            transition={150}
            contentFit="cover"
            source={require("@/assets/images/kanye.png")}
          />
        </View>

        <View
          style={{
            gap: 8,
            marginTop: 4,
            flexDirection: "row",
          }}
        >
          <View
            style={[
              {
                width: 16,
                height: 16,
                borderRadius: 1000,
                backgroundColor: theme.colors.red,
              },
              styles.shadow,
            ]}
          />
          <View
            style={[
              {
                width: 16,
                height: 16,
                borderRadius: 1000,
                backgroundColor: theme.colors.yellow,
              },
              styles.shadow,
            ]}
          />
          <View
            style={[
              {
                width: 16,
                height: 16,

                borderRadius: 1000,
                backgroundColor: theme.colors.green,
              },
              styles.shadow,
            ]}
          />
        </View>
      </View>

      <View
        style={[
          {
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 6,
            marginHorizontal: 12,
            backgroundColor: theme.colors.white,
          },
          styles.centered,
          styles.shadow,
        ]}
      >
        <View
          style={{
            gap: 20,
            flexDirection: "row",
            paddingBottom: 12,
          }}
        >
          {Array(2)
            .fill(0)
            .map((_, index) => (
              <View
                key={index}
                style={[
                  {
                    width: 12,
                    height: 12,
                    backgroundColor: theme.colors.red,
                    borderRadius: 1000,
                  },
                  styles.shadow,
                ]}
              />
            ))}
        </View>

        <GestureDetector gesture={gesture}>
          <AnimatedCamera
            ref={cameraRef}
            style={{
              height: 175,
              width: "100%",
            }}
            photo={true}
            device={device}
            isActive={true}
            photoQualityBalance="quality"
            animatedProps={animatedProps}
          />
        </GestureDetector>

        <View
          style={{
            width: "100%",
            paddingTop: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={[
              {
                width: 20,
                height: 20,
                backgroundColor: theme.colors.red,
                borderRadius: 1000,
              },
              styles.shadow,
            ]}
          />
          <View
            style={{
              gap: 4,
            }}
          >
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 32,
                    height: 2,
                    backgroundColor: theme.colors.mutedBlack,
                    borderRadius: 1000,
                  }}
                />
              ))}
          </View>
        </View>
      </View>

      <View
        style={{
          marginBottom: 60,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 1000,
              backgroundColor: theme.colors.yellow,
            },
            styles.shadow,
            styles.centered,
          ]}
          onPress={() => {
            Vibration.vibrate(50);

            router.navigate("/gallery");
          }}
          disabled={isCatching}
        >
          <GalleryIcon width={32} height={32} fill={theme.colors.black} />
        </Pressable>

        <View
          style={{
            gap: 32,
            alignItems: "center",
          }}
        >
          <View
            style={{
              gap: 20,
              flexDirection: "row",
            }}
          >
            <View
              style={[
                {
                  width: 75,
                  height: 8,
                  borderRadius: 16,
                  backgroundColor: theme.colors.blue,
                },
                styles.shadow,
              ]}
            />
            <View
              style={[
                {
                  width: 75,
                  height: 8,
                  borderRadius: 16,
                  backgroundColor: theme.colors.red,
                },
                styles.shadow,
              ]}
            />
          </View>

          <Pressable
            style={[
              {
                width: 150,
                height: 60,
                borderRadius: 6,
                backgroundColor: theme.colors.green,
              },
              styles.shadow,
              styles.centered,
            ]}
            disabled={isCatching}
            onPress={() => {
              Vibration.vibrate(50);

              router.navigate("/pc");
            }}
          >
            <Text
              style={{
                fontFamily: "Game",
              }}
            >
              Your PC
            </Text>
          </Pressable>
        </View>

        <AnimatedPressable
          disabled={isCatching}
          onPress={() => {
            Vibration.vibrate(50);

            capturePokemon();
          }}
          onPressIn={() => {
            pokeballScale.value = withTiming(0.9, { duration: 100 });
          }}
          onPressOut={() => {
            pokeballScale.value = withTiming(1, { duration: 100 });
          }}
          style={pokeballAnimatedStyle}
        >
          <Image
            style={{
              height: 60,
              width: 60,
            }}
            transition={150}
            contentFit="contain"
            source={
              isCatching
                ? require("@/assets/images/pokeball-catching.png")
                : require("@/assets/images/pokeball.png")
            }
          />
        </AnimatedPressable>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: rt.insets.top,
    backgroundColor: theme.colors.dexRed,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    borderWidth: 2,
    borderColor: theme.colors.black,
    shadowColor: theme.colors.black,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
}));
