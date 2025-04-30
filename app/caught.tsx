import React from "react";
import { eq } from "drizzle-orm";
import { Image } from "expo-image";
import * as Location from "expo-location";
import { useAudioPlayer } from "expo-audio";
import { useStyles } from "react-native-unistyles";
import { Pressable, View, Text } from "react-native";
import { Vibration, ToastAndroid } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import { db } from "@/db";
import * as schema from "@/db/schema/index";
import { getCurrentLocation } from "@/lib/utils";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Caught() {
  const { theme } = useStyles();
  const { item, shinyStatus, caughtImage } = useLocalSearchParams();
  const pokemon = JSON.parse(item as string)[0];
  const isShiny = JSON.parse(shinyStatus as string);
  const shinyPlayer = useAudioPlayer(require("@/assets/sound/shiny.mp3"));
  const caughtPlayer = useAudioPlayer(require("@/assets/sound/caught.mp3"));

  useFocusEffect(() => {
    console.log("START TTS");
  });

  async function addToPokedex() {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      ToastAndroid.show(
        "Allow location access to save to Pokédex",
        ToastAndroid.SHORT,
      );
      return;
    }

    if (isShiny) {
      shinyPlayer.seekTo(0);
      shinyPlayer.play();
    } else {
      caughtPlayer.seekTo(0);
      caughtPlayer.play();
    }

    try {
      const updatedPokemon = await db
        .update(schema.pokemons)
        .set({
          isCaught: true,
          isShiny: isShiny,
          caughtImage: caughtImage as string,
          caughtDate: new Date().toISOString(),
          caughtLocation: await getCurrentLocation(),
        })
        .where(eq(schema.pokemons.id, parseInt(pokemon.id)))
        .returning();

      router.replace({
        pathname: "/detail",
        params: { item: JSON.stringify(updatedPokemon[0]) },
      });
    } catch (error) {
      console.error("Error updating database:", error);
    }
  }

  return (
    <View
      style={{
        gap: 20,
        padding: 16,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 32,
          letterSpacing: 2,
          fontFamily: "Solid",
          textAlign: "center",
          color: theme.colors.black,
        }}
      >
        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
      </Text>

      <AnimatedImage
        style={{
          height: 300,
          width: 300,
        }}
        source={isShiny ? pokemon.shiny : pokemon.image}
        transition={150}
        contentFit="contain"
        entering={FadeInDown.duration(500).springify()}
      />

      <Animated.View entering={FadeInDown.duration(500).springify().delay(150)}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Regular",
            textAlign: "center",
            color: theme.colors.black,
          }}
        >
          {pokemon.description[0]}
        </Text>
      </Animated.View>

      <AnimatedPressable
        style={[
          {
            width: "100%",
            borderRadius: 6,
            paddingVertical: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pokemon.color,
          },
        ]}
        onPress={() => {
          Vibration.vibrate(50);

          addToPokedex();
        }}
        entering={FadeInDown.duration(500).springify().delay(300)}
      >
        <Text
          style={{
            fontFamily: "Game",
          }}
        >
          Add to Pokédex
        </Text>
      </AnimatedPressable>
    </View>
  );
}
