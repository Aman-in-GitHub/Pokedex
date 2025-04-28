import "../unistyles";
import "expo-dev-client";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { db, sqlite } from "@/db";
import migrations from "@/db/migrations/migrations";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  fade: true,
  duration: 500,
});

export default function RootLayout() {
  useDrizzleStudio(sqlite);

  const { error: migrationError } = useMigrations(db, migrations);

  if (migrationError) {
    console.error("Migration error:", migrationError);
    throw migrationError;
  }

  const [loaded, error] = useFonts({
    Solid: require("../assets/fonts/Pokemon-Solid.ttf"),
    Outline: require("../assets/fonts/Pokemon-Hollow.ttf"),
    Regular: require("../assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
