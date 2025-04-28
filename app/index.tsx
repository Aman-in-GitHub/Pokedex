import { StatusBar } from "expo-status-bar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Text, View, ActivityIndicator, Pressable } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { db } from "@/db";
import * as schema from "@/db/schema/index";
import { PAGE_SIZE } from "@/lib/constants";
import POKEMON_DATA from "@/assets/seed.json";
import ArrowUpIcon from "@/assets/icons/ArrowUp.svg";
import PokedexListItem from "@/components/PokedexListItem";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Index() {
  const { styles, theme } = useStyles(stylesheet);
  const legendListRef = useRef<LegendListRef | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  function scrollToTop() {
    if (!legendListRef.current) {
      return;
    }

    legendListRef.current.scrollToOffset({ animated: true, offset: 0 });
  }

  const {
    data,
    status,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["pokemons"],
    queryFn: async ({ pageParam = 0 }) => {
      const results = await db
        .select()
        .from(schema.pokemons)
        .limit(PAGE_SIZE)
        .offset(pageParam * PAGE_SIZE);

      return {
        pokemons: results,
        nextPage: results.length === PAGE_SIZE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const seedInitialPokedexData = useCallback(async () => {
    try {
      const data = await db.select().from(schema.pokemons).execute();

      if (data.length >= 991) {
        return;
      }

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
          color: pokemon.color,
          isShiny: pokemon.is_shiny,
          isUnlocked: pokemon.is_unlocked,
        }));

        await db.insert(schema.pokemons).values(values).execute();
      }

      await new Promise((resolve) => setTimeout(resolve, 3000));

      refetch();

      console.log("Pokédex data seeded successfully!");
    } catch (error) {
      console.error("Error seeding Pokédex data:", error);
    }
  }, [refetch]);

  useEffect(() => {
    seedInitialPokedexData();
  }, [seedInitialPokedexData]);

  const allPokemons = data?.pages.flatMap((page) => page.pokemons) || [];

  if (allPokemons.length === 0 && status !== "pending") {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.red} />
        <Text style={{ color: theme.colors.red }}>
          No Pokédex data found. Seeding...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" animated={true} translucent={true} />

      <Text
        style={{
          fontSize: 40,
          fontFamily: "Solid",
          letterSpacing: 2,
        }}
      >
        Pokédex
      </Text>

      {showScrollToTop && (
        <AnimatedPressable
          style={{
            zIndex: 1000,
            position: "absolute",
            bottom: 20,
            right: 20,
            padding: 10,
            elevation: 4,
            borderRadius: 1000,
            backgroundColor: theme.colors.black,
          }}
          onPress={scrollToTop}
          entering={FadeInDown.duration(300)}
          exiting={FadeOutDown.duration(300)}
        >
          <ArrowUpIcon fill={theme.colors.white} width={25} height={25} />
        </AnimatedPressable>
      )}

      <LegendList
        data={allPokemons}
        ref={legendListRef}
        numColumns={2}
        recycleItems={true}
        estimatedItemSize={150}
        keyExtractor={(item) => item.name}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 12,
          paddingBottom: 12,
        }}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setShowScrollToTop(offsetY > 500);
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={1}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <ActivityIndicator size="large" color={theme.colors.red} />
          ) : null
        }
        renderItem={({ item }) => (
          <PokedexListItem item={item} styles={styles} />
        )}
      />
    </View>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: rt.insets.top,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
}));
