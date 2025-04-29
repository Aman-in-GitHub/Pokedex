import Animated, {
  useAnimatedProps,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  Camera,
  useCameraDevice,
  CameraProps,
  CameraDevice,
} from "react-native-vision-camera";
import { Image } from "expo-image";
import React, { useRef } from "react";
import { useRouter } from "expo-router";
import { useAudioPlayer } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, ToastAndroid, View } from "react-native";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { savePokemonToDex } from "@/lib/utils";

Animated.addWhitelistedNativeProps({
  zoom: true,
});
const AnimatedCamera = Animated.createAnimatedComponent(Camera);

export default function Index() {
  const { styles, theme } = useStyles(stylesheet);
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice("back") as CameraDevice;
  const zoom = useSharedValue(device.neutralZoom);
  const router = useRouter();
  const catchPlayer = useAudioPlayer(require("@/assets/sound/catch.mp3"));
  const caughtPlayer = useAudioPlayer(require("@/assets/sound/caught.mp3"));

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

    catchPlayer.seekTo(0);
    catchPlayer.play();

    const photo = await cameraRef.current.takePhoto();

    try {
      await savePokemonToDex(photo.path);

      caughtPlayer.seekTo(0);
      caughtPlayer.play();
    } catch (error) {
      ToastAndroid.show("Error capturing Pokémon", ToastAndroid.SHORT);
      console.error("Error saving photo:", error);
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
        <View
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 1000,
              backgroundColor: theme.colors.mutedBlack,
            },
            styles.shadow,
          ]}
        />

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
                  width: 69,
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
                  width: 69,
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
                width: 130,
                height: 60,
                borderRadius: 6,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.green,
              },
              styles.shadow,
            ]}
            onPress={() => {
              router.navigate("/your-pc");
            }}
          >
            <Text
              style={{
                fontFamily: "Game",
              }}
            >
              YOUR PC
            </Text>
          </Pressable>
        </View>

        <Pressable onPress={capturePokemon}>
          <Image
            style={{
              height: 60,
              width: 60,
            }}
            transition={150}
            contentFit="cover"
            source={require("@/assets/images/pokeball.png")}
          />
        </Pressable>
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
