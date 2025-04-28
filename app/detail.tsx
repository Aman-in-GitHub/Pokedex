import {
  Link,
  Stack,
  useRouter,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import React from "react";
import { Image } from "expo-image";
import { useAudioPlayer } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import Animated from "react-native-reanimated";
import { Text, View, Pressable, ScrollView } from "react-native";
import { useStyles, createStyleSheet } from "react-native-unistyles";

import CryIcon from "@/assets/icons/Cry.svg";
import ArrowLeftIcon from "@/assets/icons/ArrowLeft.svg";
import ArrowRightIcon from "@/assets/icons/ArrorRight.svg";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SECTIONS = ["about", "stats", "moves", "location"];

type EvolutionType = {
  name: string;
  image: string;
  evolutionMethod: string;
};

function EvolutionList({
  color,
  firstPokemon,
  secondPokemon,
}: {
  color: string;
  firstPokemon: EvolutionType;
  secondPokemon: EvolutionType;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Image
          transition={100}
          contentFit="cover"
          source={firstPokemon.image}
          style={{ width: 100, height: 100 }}
        />
        <Text
          style={{
            textAlign: "center",
            fontFamily: "Regular",
          }}
        >
          {firstPokemon.name.charAt(0).toUpperCase() +
            firstPokemon.name.slice(1)}
        </Text>
      </View>

      <View
        style={{
          alignItems: "center",
        }}
      >
        <ArrowRightIcon width={32} height={32} fill={color} />
        <Text
          style={{
            fontFamily: "Regular",
          }}
        >
          {isNaN(parseInt(secondPokemon.evolutionMethod as string))
            ? ""
            : "Level "}
          {secondPokemon.evolutionMethod}
        </Text>
      </View>

      <View style={{ alignItems: "center" }}>
        <Image
          transition={100}
          contentFit="cover"
          source={secondPokemon.image}
          style={{ width: 100, height: 100 }}
        />
        <Text
          style={{
            fontFamily: "Regular",
            textAlign: "center",
            marginTop: 5,
          }}
        >
          {secondPokemon.name.charAt(0).toUpperCase() +
            secondPokemon.name.slice(1)}
        </Text>
      </View>
    </View>
  );
}

export default function Detail() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const pokemon = JSON.parse(item as string);
  const { styles, theme } = useStyles(stylesheet);
  const cryPlayer = useAudioPlayer(pokemon.cry);
  const initPlayer = useAudioPlayer(
    pokemon.legacyCry ? pokemon.legacyCry : pokemon.cry,
  );

  useFocusEffect(() => {
    initPlayer.play();
  });

  return (
    <>
      <StatusBar style="light" animated={true} translucent={true} />

      <Stack.Screen options={{ headerShown: false }} />

      <AnimatedPressable
        style={{
          zIndex: 1000,
          position: "absolute",
          top: 25,
          left: 10,
          padding: 8,
          overflow: "hidden",
          borderRadius: 1000,
        }}
        onPress={() => {
          router.back();
        }}
        android_ripple={{ borderless: false, foreground: true }}
      >
        <ArrowLeftIcon fill={theme.colors.white} width={32} height={32} />
      </AnimatedPressable>

      <View
        style={{
          flex: 1,
          backgroundColor: pokemon.color,
        }}
      >
        <View
          style={{
            height: 400,
            width: "100%",
          }}
        >
          <Text
            style={{
              position: "absolute",
              right: "5%",
              top: "5%",
              color: theme.colors.white,
              fontSize: 75,
              opacity: 0.1,
              fontFamily: "Solid",
              letterSpacing: 6,
            }}
          >
            #{pokemon.id}
          </Text>

          <View
            style={{
              position: "absolute",
              left: "10%",
              top: "20%",
            }}
          >
            <Text
              style={{
                color: theme.colors.white,
                fontSize: 32,
                fontFamily: "Outline",
                letterSpacing: 2.75,
              }}
            >
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Text>

            <View style={{ gap: 8, flexDirection: "row" }}>
              {pokemon.types.map((type: string) => (
                <View
                  key={`${pokemon.name}-${type}`}
                  style={[
                    {
                      paddingVertical: 4,
                      paddingHorizontal: 16,
                      borderRadius: 1000,
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                    styles.centered,
                  ]}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Regular",
                      color: theme.colors.white,
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Image
            style={{
              width: 300,
              height: 300,
              zIndex: 1000,
              position: "absolute",
              left: "50%",
              bottom: "-12%",
              transform: [{ translateX: "-50%" }],
            }}
            transition={100}
            contentFit="cover"
            source={
              pokemon.isShiny ? pokemon.shiny || pokemon.image : pokemon.image
            }
          />
        </View>

        <View
          style={{
            flex: 1,
            paddingTop: 36,
            paddingHorizontal: 16,
            backgroundColor: theme.colors.white,
            borderTopRightRadius: 32,
            borderTopLeftRadius: 32,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {SECTIONS.map((section) => (
              <Pressable key={section}>
                <Text
                  style={{
                    fontFamily: "Regular",
                    color: theme.colors.black,
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            style={{
              gap: 4,
              marginTop: 4,
            }}
            showsVerticalScrollIndicator={false}
          >
            {pokemon.description
              .slice(0, 4)
              .map((desc: string, index: number) => {
                const indexStr: string = index.toString();

                return (
                  <Text
                    key={indexStr}
                    style={{
                      fontFamily: "Regular",
                    }}
                  >
                    {desc}
                  </Text>
                );
              })}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 12,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderWidth: 1.5,
                borderRadius: 12,
                borderColor: pokemon.color,
              }}
            >
              <View>
                <Text style={{ fontFamily: "Regular" }}>Height</Text>
                <Text style={{ fontFamily: "Regular" }}>
                  {(parseInt(pokemon.height) / 10).toFixed(2)} m |{" "}
                  {((parseInt(pokemon.height) / 10) * 3.28084).toFixed(2)} ft
                </Text>
              </View>
              <View>
                <Text style={{ fontFamily: "Regular", textAlign: "right" }}>
                  Weight
                </Text>
                <Text style={{ fontFamily: "Regular", textAlign: "right" }}>
                  {(parseInt(pokemon.weight) / 10).toFixed(2)} kg |{" "}
                  {((parseInt(pokemon.weight) / 10) * 2.20462).toFixed(2)} lbs
                </Text>
              </View>
            </View>

            {pokemon.evolutions.length > 1 && (
              <>
                <EvolutionList
                  firstPokemon={pokemon.evolutions[0]}
                  secondPokemon={pokemon.evolutions[1]}
                  color={pokemon.color}
                />

                {pokemon.evolutions.length > 2 && (
                  <EvolutionList
                    firstPokemon={pokemon.evolutions[1]}
                    secondPokemon={pokemon.evolutions[2]}
                    color={pokemon.color}
                  />
                )}
              </>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: 8,
              }}
            >
              <Link
                href={`https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}`}
              >
                <Text
                  style={{
                    fontFamily: "Regular",
                    color: pokemon.color,
                    textDecorationLine: "underline",
                  }}
                >
                  Bulbapedia wiki
                </Text>
              </Link>

              <CryIcon
                width={32}
                height={32}
                fill={pokemon.color}
                onPress={() => cryPlayer.play()}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </>
  );
}

const stylesheet = createStyleSheet((theme, rt) => ({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
}));
