import { Stack } from "expo-router";
import { count, eq } from "drizzle-orm";
import { Vibration } from "react-native";
import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Text, View, Pressable } from "react-native";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { db } from "@/db";
import Loader from "@/components/Loader";
import UpIcon from "@/assets/icons/Up.svg";
import * as schema from "@/db/schema/index";
import PokedexListItem from "@/components/PokedexListItem";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function YourPC() {
  const { styles, theme } = useStyles(stylesheet);
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
  const allPokemons = data?.pokemons || [];

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

        <Text
          style={{
            fontSize: 20,
            fontFamily: "Game",
          }}
        >
          {caughtCount}/{totalCount}
        </Text>
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
