import React from "react";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import Animated from "react-native-reanimated";
import { Text, View, Pressable } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useStyles, createStyleSheet } from "react-native-unistyles";

import ArrowLeftIcon from "@/assets/icons/ArrowLeft.svg";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Detail() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const pokemon = JSON.parse(item as string);
  const { styles, theme } = useStyles(stylesheet);

  return (
    <>
      <StatusBar style="light" animated={true} translucent={true} />

      <Stack.Screen options={{ headerShown: false }} />

      <AnimatedPressable
        style={{
          zIndex: 1000,
          position: "absolute",
          top: 25,
          left: 10,
          padding: 8,
          overflow: "hidden",
          borderRadius: 1000,
        }}
        onPress={() => {
          router.back();
        }}
        android_ripple={{ borderless: false, foreground: true }}
      >
        <ArrowLeftIcon fill={theme.colors.white} width={32} height={32} />
      </AnimatedPressable>

      <View
        style={{
          flex: 1,
          backgroundColor: pokemon.color,
        }}
      >
        <View
          style={{
            height: 400,
            width: "100%",
          }}
        >
          <Text
            style={{
              position: "absolute",
              right: "5%",
              top: "5%",
              color: theme.colors.white,
              fontSize: 75,
              opacity: 0.1,
              fontFamily: "Solid",
              letterSpacing: 5,
            }}
          >
            #{pokemon.id}
          </Text>

          <View
            style={{
              position: "absolute",
              left: "10%",
              top: "20%",
            }}
          >
            <Text
              style={{
                color: theme.colors.white,
                fontSize: 32,
                fontFamily: "Outline",
                letterSpacing: 2.75,
              }}
            >
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>

            <View style={{ gap: 6, marginTop: 4, flexDirection: "row" }}>
              {pokemon.types.map((type: string) => (
                <View
                  key={`${pokemon.name}-${type}`}
                  style={[
                    {
                      paddingVertical: 4,
                      paddingHorizontal: 16,
                      borderRadius: 1000,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                    styles.centered,
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Regular",
                      color: theme.colors.white,
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Image
            style={{
              width: 300,
              height: 300,
              zIndex: 1000,
              position: "absolute",
              left: "50%",
              bottom: "-15%",
              transform: [{ translateX: "-50%" }],
            }}
            transition={100}
            contentFit="cover"
            source={pokemon.image}
          />
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.white,
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
          }}
        ></View>
      </View>
    </>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
}));
