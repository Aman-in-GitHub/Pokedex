import React from "react";
import { sql } from "drizzle-orm";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LegendList } from "@legendapp/list";
import { useQuery } from "@tanstack/react-query";
import { useStyles, createStyleSheet } from "react-native-unistyles";

import { db } from "@/db";
import * as schema from "@/db/schema/index";
import Loader from "@/components/Loader";

export default function Gallery() {
  const { styles } = useStyles(stylesheet);

  const { data, status } = useQuery({
    queryKey: ["caughtImages"],
    queryFn: async () => {
      const results = await db
        .select()
        .from(schema.pokemons)
        .where(sql`json_array_length(caught_images) > 0`);

      const allImages = results.flatMap((pokemon) => {
        const images =
          typeof pokemon.caughtImages === "string"
            ? JSON.parse(pokemon.caughtImages)
            : pokemon.caughtImages;

        return images.map((imageUri: string) => ({
          id: pokemon.id,
          uri: imageUri,
          pokemonName: pokemon.name,
        }));
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      return allImages;
    },
  });

  if (status === "pending") {
    return (
      <>
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
          estimatedItemSize={150}
          keyExtractor={(item) => item.uri}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            gap: 16,
            paddingBottom: 16,
          }}
          renderItem={({ item }) => {
            return (
              <Image
                style={{
                  height: 150,
                  width: "100%",
                  borderRadius: 16,
                }}
                source={item.uri}
                transition={150}
              />
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
