import { Stack } from "expo-router";
import { count, eq } from "drizzle-orm";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import React, { useState, useRef, useMemo } from "react";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { Text, View, Pressable, ToastAndroid, Vibration } from "react-native";

import { db } from "@/db";
import Loader from "@/components/Loader";
import UpIcon from "@/assets/icons/Up.svg";
import * as schema from "@/db/schema/index";
import FilterIcon from "@/assets/icons/Filter.svg";
import PokedexListItem from "@/components/PokedexListItem";

type FilterMode = "all" | "caught" | "uncaught" | "shiny";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function YourPC() {
  const { styles, theme } = useStyles(stylesheet);
  const [filter, setFilter] = useState<FilterMode>("all");
  const legendListRef = useRef<LegendListRef | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  function scrollToTop() {
    if (!legendListRef.current) {
      return;
    }

    legendListRef.current.scrollToOffset({ animated: true, offset: 0 });
  }

  const { data, status } = useQuery({
    queryKey: ["pokemons"],
    queryFn: async () => {
      const results = await db.select().from(schema.pokemons);

      const totalCountResult = await db
        .select({ value: count() })
        .from(schema.pokemons);

      const caughtCountResult = await db
        .select({ value: count() })
        .from(schema.pokemons)
        .where(eq(schema.pokemons.isCaught, true));

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        pokemons: results,
        totalCount: totalCountResult[0].value,
        caughtCount: caughtCountResult[0].value,
      };
    },
  });

  const totalCount = data?.totalCount;
  const caughtCount = data?.caughtCount;
  const allPokemons = data?.pokemons;

  const filteredPokemons = useMemo(() => {
    if (!allPokemons) return [];

    switch (filter) {
      case "caught":
        return allPokemons.filter((pokemon) => pokemon.isCaught);
      case "uncaught":
        return allPokemons.filter((pokemon) => !pokemon.isCaught);
      case "shiny":
        return allPokemons.filter((pokemon) => pokemon.isShiny);
      default:
        return allPokemons;
    }
  }, [allPokemons, filter]);

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
          Your PC
        </Text>

        <Pressable
          style={{
            gap: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => {
            Vibration.vibrate(50);

            const nextFilter: FilterMode =
              filter === "all"
                ? "caught"
                : filter === "caught"
                  ? "uncaught"
                  : filter === "uncaught"
                    ? "shiny"
                    : "all";

            const modeLabel =
              nextFilter === "all"
                ? "All Pokémon"
                : nextFilter === "caught"
                  ? "Caught Pokémon"
                  : nextFilter === "uncaught"
                    ? "Uncaught Pokémon"
                    : "Shiny Pokémon";

            ToastAndroid.show(`Mode: ${modeLabel}`, ToastAndroid.SHORT);

            setFilter(nextFilter);
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: "Game",
            }}
          >
            {caughtCount}/{totalCount}
          </Text>

          <FilterIcon width={32} height={32} color={theme.colors.black} />
        </Pressable>
      </View>

      {showScrollToTop && (
        <AnimatedPressable
          style={{
            zIndex: 1000,
            position: "absolute",
            bottom: -15,
            right: 0,
            elevation: 5,
          }}
          onPress={() => {
            Vibration.vibrate(50);

            scrollToTop();
          }}
          entering={FadeInDown.duration(500).springify()}
          exiting={FadeOutDown.duration(500).springify()}
        >
          <UpIcon fill={theme.colors.white} width={90} height={90} />
        </AnimatedPressable>
      )}

      {filteredPokemons.length > 0 ? (
        <LegendList
          key={filter}
          ref={legendListRef}
          data={filteredPokemons}
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
          renderItem={({ item }) => (
            <PokedexListItem item={item} styles={styles} />
          )}
        />
      ) : (
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
              fontSize: 20,
              letterSpacing: 1.1,
              fontFamily: "Solid",
              textAlign: "center",
            }}
          >
            No {filter} Pokémon found
          </Text>
        </View>
      )}
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
