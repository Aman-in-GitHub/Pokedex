import { Stack } from "expo-router";
import { count, eq } from "drizzle-orm";
import { StatusBar } from "expo-status-bar";
import React, { useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LegendList, LegendListRef } from "@legendapp/list";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import { Text, View, ActivityIndicator, Pressable } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import { db } from "@/db";
import Loader from "@/components/Loader";
import * as schema from "@/db/schema/index";
import { PAGE_SIZE } from "@/lib/constants";
import UpIcon from "@/assets/icons/Up.svg";
import PokedexListItem from "@/components/PokedexListItem";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function YourPc() {
  const { styles, theme } = useStyles(stylesheet);
  const legendListRef = useRef<LegendListRef | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  function scrollToTop() {
    if (!legendListRef.current) {
      return;
    }

    legendListRef.current.scrollToOffset({ animated: true, offset: 0 });
  }

  const { data, status, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["pokemons"],
      queryFn: async ({ pageParam = 0 }) => {
        const results = await db
          .select()
          .from(schema.pokemons)
          .limit(PAGE_SIZE)
          .offset(pageParam * PAGE_SIZE);

        const totalCountResult = await db
          .select({ value: count() })
          .from(schema.pokemons);

        const caughtCountResult = await db
          .select({ value: count() })
          .from(schema.pokemons)
          .where(eq(schema.pokemons.isCaught, true));

        if (pageParam === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        return {
          pokemons: results,
          totalCount: totalCountResult[0].value,
          caughtCount: caughtCountResult[0].value,
          nextPage: results.length === PAGE_SIZE ? pageParam + 1 : undefined,
        };
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      initialPageParam: 0,
    });

  const allPokemons = data?.pages.flatMap((page) => page.pokemons) || [];
  const totalCount = data?.pages[0].totalCount;
  const caughtCount = data?.pages[0].caughtCount;

  if (status === "pending") {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

        <Loader />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar style="dark" animated={true} translucent={true} />

      <View
        style={{
          paddingVertical: 16,
          flexDirection: "row",
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
          onPress={scrollToTop}
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
