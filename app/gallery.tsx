import React from "react";
import { sql } from "drizzle-orm";
import { Image } from "expo-image";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LegendList } from "@legendapp/list";
import { useQuery } from "@tanstack/react-query";
import { Pressable, Text, Vibration, View } from "react-native";
import { useStyles, createStyleSheet } from "react-native-unistyles";

import { db } from "@/db";
import Loader from "@/components/Loader";
import * as schema from "@/db/schema/index";
import { capitalizeFirstLetter } from "@/lib/utils";

export default function Gallery() {
  const { styles } = useStyles(stylesheet);

  const { data, status } = useQuery({
    queryKey: ["caughtImages"],
    queryFn: async () => {
      const results = await db
        .select()
        .from(schema.pokemons)
        .where(sql`json_array_length(caught_images) > 0`)
        .orderBy(schema.pokemons.id);

      const allImages = results.flatMap((pokemon) => {
        const images =
          typeof pokemon.caughtImages === "string"
            ? JSON.parse(pokemon.caughtImages)
            : pokemon.caughtImages;

        return images.map((imageUri: string) => ({
          uri: imageUri,
          pokemon: pokemon,
        }));
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return allImages;
    },
  });

  if (status === "pending") {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <StatusBar style="dark" animated={true} translucent={true} />

        <Loader />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" animated={true} translucent={true} />

      <View
        style={{
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Game",
          }}
        >
          Your Gallery
        </Text>

        <Text
          style={{
            fontSize: 20,
            fontFamily: "Game",
          }}
        >
          {data ? data.length : 0}
        </Text>
      </View>

      {data && data?.length === 0 && (
        <View
          style={[
            {
              flex: 1,
            },
            styles.centered,
          ]}
        >
          <Text
            style={{
              fontSize: 32,
              letterSpacing: 2,
              fontFamily: "Solid",
              textAlign: "center",
            }}
          >
            No images found
          </Text>
        </View>
      )}

      {data && data?.length > 0 && (
        <LegendList
          data={data}
          numColumns={2}
          recycleItems={true}
          estimatedItemSize={169}
          keyExtractor={(item) => item.uri}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 16,
            paddingBottom: 16,
          }}
          renderItem={({ item }) => {
            return (
              <Pressable
                style={{
                  gap: 6,
                }}
                onPress={() => {
                  Vibration.vibrate(50);

                  router.navigate({
                    pathname: "/detail",
                    params: { item: JSON.stringify(item.pokemon) },
                  });
                }}
              >
                <Image
                  style={{
                    height: 150,
                    width: "100%",
                    borderRadius: 16,
                  }}
                  source={item.uri}
                  transition={150}
                />

                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: "Game",
                  }}
                >
                  # {item.pokemon.id} -{" "}
                  {capitalizeFirstLetter(item.pokemon.name)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: rt.insets.top,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
}));
