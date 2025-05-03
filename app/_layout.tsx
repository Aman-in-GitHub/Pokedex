import "../unistyles";
import "expo-dev-client";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import React, { useState, useEffect, useCallback } from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { db, sqlite } from "@/db";
import * as schema from "@/db/schema/index";
import { cleanDirectory } from "@/lib/utils";
import POKEMON_DATA from "@/assets/seed.json";
import { TEMP_DIRECTORY } from "@/lib/constants";
import migrations from "@/db/migrations/migrations";

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
    Game: require("../assets/fonts/Pokemon-Game.ttf"),
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

      console.log("Starting data seeding...");

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
          caughtImages: [],
          caughtDate: "",
          caughtLocation: [],
        }));

        await db.insert(schema.pokemons).values(values);
      }

      setIsSeeding(false);

      console.log("Pokédex data seeded successfully!");
    } catch (error) {
      console.error("Error seeding Pokédex data:", error);
    } finally {
      await cleanDirectory(TEMP_DIRECTORY);
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
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY}
      options={{
        host: "https://us.i.posthog.com",
        enableSessionReplay: true,
        sessionReplayConfig: {
          // Password inputs are always masked regardless
          maskAllTextInputs: true,
          // Whether images are masked. Default is true.
          maskAllImages: true,
          // Capture logs automatically. Default is true.
          // Android only (Native Logcat only)
          captureLog: true,
          // Whether network requests are captured in recordings. Default is true
          // Only metric-like data like speed, size, and response code are captured.
          // No data is captured from the request or response body.
          // iOS only
          captureNetworkTelemetry: true,
          // Deboucer delay used to reduce the number of snapshots captured and reduce performance impact. Default is 500ms
          androidDebouncerDelayMs: 500,
          // Deboucer delay used to reduce the number of snapshots captured and reduce performance impact. Default is 1000ms
          iOSdebouncerDelayMs: 1000,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="pc" options={{ headerShown: false }} />
            <Stack.Screen name="detail" options={{ headerShown: false }} />
            <Stack.Screen name="gallery" options={{ headerShown: false }} />
            <Stack.Screen
              name="caught"
              options={{
                title: "Caught",
                presentation: "formSheet",
                gestureDirection: "vertical",
                animation: "slide_from_bottom",
                sheetInitialDetentIndex: 0,
                sheetAllowedDetents: [0.75],
                sheetCornerRadius: 32,
                sheetElevation: 32,
              }}
            />
            <Stack.Screen
              name="victory"
              options={{
                title: "Victory",
                presentation: "formSheet",
                gestureDirection: "vertical",
                animation: "slide_from_bottom",
                sheetInitialDetentIndex: 0,
                sheetAllowedDetents: [0.95],
                sheetCornerRadius: 32,
                sheetElevation: 32,
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </PostHogProvider>
  );
}
