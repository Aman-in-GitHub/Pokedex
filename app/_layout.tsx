import "../unistyles";
import "expo-dev-client";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import React, { useState, useEffect, useCallback } from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { db, sqlite } from "@/db";
import * as schema from "@/db/schema/index";
import migrations from "@/db/migrations/migrations";
import POKEMON_DATA from "@/assets/seed.json";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
  duration: 500,
});

export default function RootLayout() {
  useDrizzleStudio(sqlite);

  const { success, error: migrationError } = useMigrations(db, migrations);

  if (migrationError) {
    console.error("Migration error:", migrationError);
    throw migrationError;
  }

  const [loaded, error] = useFonts({
    Solid: require("../assets/fonts/Pokemon-Solid.ttf"),
    Outline: require("../assets/fonts/Pokemon-Hollow.ttf"),
    Regular: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  const [isSeeding, setIsSeeding] = useState(true);

  const seedInitialPokedexData = useCallback(async () => {
    if (!success) {
      return;
    }

    try {
      const data = await db.select().from(schema.pokemons);

      if (data.length >= 991) {
        setIsSeeding(false);
        return;
      }

      setIsSeeding(true);

      console.log("Starting data seed");

      const batchSize = 100;

      for (let i = 0; i < POKEMON_DATA.length; i += batchSize) {
        const batch = POKEMON_DATA.slice(i, i + batchSize);

        const values = batch.map((pokemon) => ({
          name: pokemon.name,
          description: pokemon.description,
          generation: pokemon.generation,
          cry: pokemon.cry,
          legacyCry: pokemon.legacy_cry,
          image: pokemon.image,
          shiny: pokemon.shiny,
          extraImages: pokemon.extra_images,
          evolutions: pokemon.evolutions,
          types: pokemon.types,
          height: pokemon.height,
          weight: pokemon.weight,
          stats: pokemon.stats,
          locations: pokemon.locations,
          color: pokemon.color,
          isShiny: pokemon.is_shiny,
          isCaught: pokemon.is_caught,
        }));

        await db.insert(schema.pokemons).values(values);
      }

      setIsSeeding(false);

      console.log("Pokédex data seeded successfully!");
    } catch (error) {
      console.error("Error seeding Pokédex data:", error);
    }
  }, [success]);

  useEffect(() => {
    seedInitialPokedexData();
  }, [seedInitialPokedexData, success]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && isSeeding === false) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isSeeding]);

  if (!loaded || isSeeding) {
    return null;
  }

  return <RootLayoutNav />;
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
