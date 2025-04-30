import {
  Link,
  useRouter,
  useFocusEffect,
  useLocalSearchParams,
  Stack,
} from "expo-router";
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Vibration,
  Dimensions,
} from "react-native";
import Animated, {
  FadeInLeft,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { useAudioPlayer } from "expo-audio";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { Camera, MapView } from "@maplibre/maplibre-react-native";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import { lightenColor } from "@/lib/utils";
import MusicIcon from "@/assets/icons/Music.svg";
import ArrowIcon from "@/assets/icons/Arrow.svg";
import { MAP_STYLE_URL, MAX_STAT_VALUE, POKEMON_STATS } from "@/lib/constants";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SECTIONS = ["about", "stats", "location"];

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
          transition={150}
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
        <ArrowIcon fill={color} width={50} height={50} />
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
          transition={150}
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

function StatBar({ statKey, label, color, value, index }: any) {
  const progress = useSharedValue(0);

  const percentage = (value / MAX_STAT_VALUE) * 100;

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 1000 });
  }, [percentage, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
      position: "absolute",
      height: 100,
      backgroundColor: lightenColor(color, 0.3),
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: "100%",
          borderRadius: 12,
          paddingVertical: 14,
          backgroundColor: lightenColor(color, 0.05),
          position: "relative",
          overflow: "hidden",
        },
      ]}
      entering={FadeInDown.duration(500)
        .delay(index * 100)
        .springify()}
    >
      <Animated.View style={animatedStyle} />

      <Text
        style={{
          fontFamily: "Game",
          color: color,
          fontSize: 12,
          zIndex: 1000,
          paddingHorizontal: 16,
        }}
      >
        {label}: {value}
      </Text>
    </Animated.View>
  );
}

export default function Detail() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const pokemon = JSON.parse(item as string);
  const { styles, theme } = useStyles(stylesheet);
  const cryPlayer = useAudioPlayer(pokemon.cry);
  const initPlayer = useAudioPlayer(
    pokemon.name === "pikachu"
      ? require("@/assets/sound/pikachu.mp3")
      : pokemon.name === "eevee"
        ? require("@/assets/sound/eevee.mp3")
        : pokemon.legacyCry
          ? pokemon.legacyCry
          : pokemon.cry,
  );
  const carouselRef = useRef<ICarouselInstance>(null);
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);

  useFocusEffect(() => {
    initPlayer.play();
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar style="light" animated={true} translucent={true} />

      <AnimatedPressable
        style={{
          zIndex: 1000,
          position: "absolute",
          top: 25,
          left: 10,
        }}
        onPress={() => {
          router.back();
        }}
      >
        <ArrowIcon
          fill={theme.colors.white}
          width={50}
          height={50}
          style={{
            paddingBottom: 2,
            transform: [{ rotate: "180deg" }],
          }}
        />
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
              fontSize: 75,
              opacity: 0.1,
              fontFamily: "Solid",
              letterSpacing: 6,
              color: theme.colors.white,
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
            <Animated.Text
              style={{
                color: theme.colors.white,
                fontSize: 32,
                fontFamily: "Outline",
                letterSpacing: 2.75,
              }}
              entering={FadeInLeft.duration(500).springify()}
            >
              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
            </Animated.Text>

            <View style={{ gap: 8, flexDirection: "row" }}>
              {pokemon.types.map((type: string) => (
                <Animated.View
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
                  entering={FadeInLeft.duration(500).springify()}
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
                </Animated.View>
              ))}
            </View>
          </View>

          <Animated.View
            style={{
              position: "absolute",
              left: "50%",
              bottom: "-16%",
              transform: [{ translateX: "-50%" }],
              zIndex: 1000,
            }}
          >
            <Carousel
              height={300}
              width={Dimensions.get("screen").width}
              autoPlay={true}
              ref={carouselRef}
              mode="parallax"
              autoPlayInterval={3000}
              scrollAnimationDuration={1000}
              data={[
                pokemon.isShiny
                  ? pokemon.shiny || pokemon.image
                  : pokemon.image,
                ...pokemon.extraImages,
              ]}
              renderItem={({ item }) => (
                <AnimatedImage
                  style={{
                    height: 300,
                    width: Dimensions.get("screen").width,
                  }}
                  source={item}
                  transition={150}
                  contentFit="contain"
                  entering={FadeInDown.duration(500).springify()}
                />
              )}
            />
          </Animated.View>
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
              <Pressable
                key={section}
                onPress={() => {
                  if (section === activeSection) {
                    return;
                  }

                  Vibration.vibrate(50);
                  setActiveSection(section);
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    letterSpacing: 1.5,
                    fontFamily: "Solid",
                    color:
                      section === activeSection
                        ? pokemon.color
                        : theme.colors.mutedBlack,
                    textDecorationLine:
                      section === activeSection ? "underline" : "none",
                    textDecorationStyle: "solid",
                  }}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {activeSection === "about" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {pokemon.description
                .slice(0, 4)
                .map((desc: string, index: number) => {
                  const indexStr: string = index.toString();

                  return (
                    <Animated.Text
                      key={indexStr}
                      style={{
                        marginTop: 4,
                        fontFamily: "Regular",
                      }}
                      entering={FadeInDown.duration(500)
                        .delay(index * 100)
                        .springify()}
                    >
                      <Text
                        style={{
                          fontFamily: "Game",
                        }}
                      >
                        {index}.
                      </Text>{" "}
                      {desc}
                    </Animated.Text>
                  );
                })}

              <Animated.View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginVertical: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderWidth: 2,
                  borderRadius: 12,
                  borderColor: pokemon.color,
                }}
                entering={FadeInDown.duration(1000).springify()}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "Regular",
                      color: theme.colors.mutedBlack,
                    }}
                  >
                    Height
                  </Text>
                  <Text style={{ fontFamily: "Regular" }}>
                    {(parseInt(pokemon.height) / 10).toFixed(2)} m
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: "Regular",
                      color: theme.colors.mutedBlack,
                    }}
                  >
                    Weight
                  </Text>
                  <Text style={{ fontFamily: "Regular" }}>
                    {(parseInt(pokemon.weight) / 10).toFixed(2)} kg
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: "Regular",
                      color: theme.colors.mutedBlack,
                    }}
                  >
                    Generation
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Regular",
                      letterSpacing: 1,
                    }}
                  >
                    Gen - {pokemon.generation.split("-")[1]?.toUpperCase()}
                  </Text>
                </View>
              </Animated.View>

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
                  paddingVertical: 8,
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

                <MusicIcon
                  width={32}
                  height={32}
                  fill={pokemon.color}
                  onPress={() => {
                    cryPlayer.seekTo(0);
                    cryPlayer.play();
                  }}
                  style={{ marginRight: -8 }}
                />
              </View>
            </ScrollView>
          )}

          {activeSection === "stats" && (
            <View
              style={{
                flex: 1,
                paddingVertical: 6,
                paddingBottom: 12,
                justifyContent: "space-between",
              }}
            >
              {POKEMON_STATS.map(({ key, label, color }, index) => (
                <StatBar
                  key={key}
                  statKey={key}
                  label={label}
                  color={color}
                  value={pokemon.stats[key]}
                  index={index}
                />
              ))}
            </View>
          )}

          {activeSection === "location" && (
            <ScrollView
              style={{
                flex: 1,
                paddingTop: 6,
              }}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                }}
                entering={FadeInDown.duration(500).springify()}
              >
                <MapView
                  style={{
                    height: 200,
                    width: "100%",
                  }}
                  mapStyle={MAP_STYLE_URL}
                  attributionEnabled={false}
                  preferredFramesPerSecond={60}
                >
                  <Camera
                    pitch={75}
                    zoomLevel={15}
                    animationMode="flyTo"
                    animationDuration={2000}
                    defaultSettings={{
                      centerCoordinate: [139.72921376408274, 35.66076485905221],
                    }}
                  />
                </MapView>
              </Animated.View>

              <Animated.View
                style={{
                  marginVertical: 8,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                entering={FadeInDown.duration(500).springify().delay(150)}
              >
                <Text
                  style={{
                    fontFamily: "Regular",
                  }}
                >
                  Time: 2:30 pm
                </Text>
                <Text
                  style={{
                    fontFamily: "Regular",
                  }}
                >
                  Date: Monday 23rd February
                </Text>
              </Animated.View>

              <AnimatedImage
                style={{
                  height: 200,
                  width: "100%",
                  marginBottom: 20,
                  borderRadius: 12,
                }}
                source={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9l2T0bmKHoGHLrgU4LMBNqgrDR59DEL-MlA&s"
                }
                transition={150}
                contentFit="cover"
                entering={FadeInDown.duration(500).springify().delay(300)}
              />
            </ScrollView>
          )}
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
