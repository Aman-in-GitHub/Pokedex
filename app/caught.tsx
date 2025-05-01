import { eq } from "drizzle-orm";
import { Image } from "expo-image";
import * as Speech from "expo-speech";
import * as Location from "expo-location";
import { useAudioPlayer } from "expo-audio";
import React, { useCallback, useState } from "react";
import { Pressable, View, Text } from "react-native";
import { Vibration, ToastAndroid } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  getCurrentLocation,
  sanitizeForSpeech,
  savePokemonToDex,
} from "@/lib/utils";
import { db } from "@/db";
import * as schema from "@/db/schema/index";
import { CAUGHT_IMAGES_DIRECTORY } from "@/lib/constants";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Caught() {
  const { styles, theme } = useStyles(stylesheet);
  const [isSaving, setIsSaving] = useState(false);
  const { item, shinyStatus, tempCaughtImage } = useLocalSearchParams();
  const pokemon = JSON.parse(item as string)[0];
  const isShiny = JSON.parse(shinyStatus as string);
  const cryPlayer = useAudioPlayer(
    pokemon.legacyCry ? pokemon.legacyCry : pokemon.cry,
  );

  useFocusEffect(
    useCallback(() => {
      cryPlayer.seekTo(0);
      cryPlayer.play();

      const nativeLocations = pokemon.locations.slice(0, 3);
      let locationText = "";
      if (nativeLocations.length === 1) {
        locationText = nativeLocations[0];
      } else if (nativeLocations.length === 2) {
        locationText = `${nativeLocations[0]} and ${nativeLocations[1]}`;
      } else if (nativeLocations.length === 3) {
        locationText = `${nativeLocations[0]}, ${nativeLocations[1]}, and ${nativeLocations[2]}`;
      }

      const tid = setTimeout(() => {
        const descLine = `${pokemon.name}. ${pokemon.description[0]}.`;
        const statsLine = `It weighs ${(pokemon.weight / 10).toFixed(1)} kilograms and is ${(pokemon.height / 10).toFixed(1)} meters tall.`;
        const locLine =
          nativeLocations.length > 1
            ? `${pokemon.name} can typically be found in ${sanitizeForSpeech(locationText)}.`
            : "";

        Speech.speak([descLine, statsLine, locLine].filter(Boolean).join(" "), {
          rate: 1.25,
        });
      }, 1500);

      return () => {
        Speech.stop();
        clearTimeout(tid);
      };
    }, []),
  );

  async function addToPokedex() {
    setIsSaving(true);

    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      ToastAndroid.show(
        "Allow location access to save to Pokédex",
        ToastAndroid.SHORT,
      );
      setIsSaving(false);
      return;
    }

    try {
      const existingImages = pokemon.caughtImages || [];

      const savedPath = await savePokemonToDex(
        tempCaughtImage as string,
        CAUGHT_IMAGES_DIRECTORY,
      );

      const updatedPokemon = await db
        .update(schema.pokemons)
        .set({
          isCaught: true,
          isShiny: isShiny,
          caughtImages: [...existingImages, savedPath],
          caughtDate: new Date().toISOString(),
          caughtLocation: await getCurrentLocation(),
        })
        .where(eq(schema.pokemons.id, parseInt(pokemon.id)))
        .returning();

      router.replace({
        pathname: "/detail",
        params: {
          item: JSON.stringify(updatedPokemon[0]),
          isFirstTime: "true",
        },
      });
    } catch (error) {
      console.error("Error updating database:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
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
            backgroundColor: pokemon.color,
          },
          styles.centered,
        ]}
        disabled={isSaving}
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
          Add To Pokédex
        </Text>
      </AnimatedPressable>
    </View>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  container: {
    gap: 20,
    padding: 16,
    alignItems: "center",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
}));
