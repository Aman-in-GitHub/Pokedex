import Animated, {
  withTiming,
  withRepeat,
  useSharedValue,
  cancelAnimation,
  useAnimatedStyle,
} from "react-native-reanimated";
import { eq } from "drizzle-orm";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useAudioPlayer } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import { Pressable, Text, ToastAndroid, Vibration, View } from "react-native";

import { db } from "@/db";
import * as schema from "@/db/schema/index";
import { TEMP_DIRECTORY } from "@/lib/constants";
import GalleryIcon from "@/assets/icons/Gallery.svg";
import { savePokemonToDex, verifyWithPokedex } from "@/lib/utils";

Animated.addWhitelistedNativeProps({
  zoom: true,
});
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Index() {
  const { styles, theme } = useStyles(stylesheet);
  const cameraRef = useRef<CameraView>(null);
  const [isCatching, setIsCatching] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const catchPlayer = useAudioPlayer(require("@/assets/sound/catch.mp3"));
  const runawayPlayer = useAudioPlayer(require("@/assets/sound/runaway.mp3"));

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();

      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, []);

  const pokeballScale = useSharedValue(1);

  const pokeballAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pokeballScale.value }],
    };
  });

  const isBlinking = useRef(false);

  const opacity = useSharedValue(1);

  const animatedBlinkingStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  function startBlinking() {
    if (!isBlinking.current) {
      isBlinking.current = true;
      opacity.value = withRepeat(withTiming(0.5, { duration: 1000 }), -1, true);
    }
  }

  function stopBlinking() {
    isBlinking.current = false;
    cancelAnimation(opacity);
    opacity.value = 1;
  }

  async function capturePokemon() {
    if (!permission?.granted || !cameraRef.current) {
      const cameraPermission = await requestPermission();

      if (!cameraPermission.granted) {
        ToastAndroid.show(
          "Camera permission is required to capture Pokémon",
          ToastAndroid.SHORT,
        );
      }

      return;
    }

    setIsCatching(true);
    startBlinking();

    const photo = await cameraRef.current.takePictureAsync({
      quality: 1,
      shutterSound: false,
      skipProcessing: true,
    });

    if (!photo) {
      setIsCatching(false);
      stopBlinking();
      return;
    }

    catchPlayer.seekTo(0);
    catchPlayer.play();

    setCapturedImage(photo.uri);

    try {
      const tempPath = await savePokemonToDex(photo.uri, TEMP_DIRECTORY);

      const res: any = await verifyWithPokedex(tempPath || "");

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
      setCapturedImage(null);
      stopBlinking();
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

        {capturedImage ? (
          <Image
            style={{
              height: 175,
              width: "100%",
              borderRadius: 6,
            }}
            transition={150}
            contentFit="cover"
            source={capturedImage}
          />
        ) : (
          <>
            {permission?.granted ? (
              <CameraView
                ref={cameraRef}
                style={{
                  height: 175,
                  width: "100%",
                  borderRadius: 6,
                }}
                zoom={0}
                facing="back"
                mode="picture"
                animateShutter={false}
              />
            ) : (
              <View
                style={[
                  {
                    padding: 6,
                    height: 175,
                    width: "100%",
                    borderRadius: 6,
                    backgroundColor: theme.colors.dexRed,
                  },
                  styles.centered,
                ]}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Game",
                    textAlign: "center",
                    color: theme.colors.black,
                  }}
                >
                  Camera permission is required to capture Pokémon.
                </Text>
              </View>
            )}
          </>
        )}

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
          <AnimatedImage
            style={[
              {
                height: 60,
                width: 60,
              },
              animatedBlinkingStyle,
            ]}
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
    paddingHorizontal: 20,
    paddingTop: rt.insets.top,
    justifyContent: "space-between",
    backgroundColor: theme.colors.dexRed,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  shadow: {
    elevation: 5,
    borderWidth: 2,
    shadowRadius: 0,
    shadowOpacity: 1,
    borderColor: theme.colors.black,
    shadowColor: theme.colors.black,
  },
}));
