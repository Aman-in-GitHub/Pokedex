import {
  Link,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Vibration,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import React, { useState, useRef, useCallback } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Camera, MapView } from "@maplibre/maplibre-react-native";
import { useStyles, createStyleSheet } from "react-native-unistyles";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

import {
  SECTIONS,
  MAP_STYLE_URL,
  POKEMON_STATS,
  DEFAULT_CAUGHT_LOCATION,
} from "@/lib/constants";
import StatBar from "@/components/StatBar";
import MusicIcon from "@/assets/icons/Music.svg";
import ArrowIcon from "@/assets/icons/Arrow.svg";
import EvolutionList from "@/components/EvolutionList";
import { formatISODate, capitalizeFirstLetter } from "@/lib/utils";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Detail() {
  const { styles, theme } = useStyles(stylesheet);
  const { item, isFirstTime = "false" } = useLocalSearchParams();
  const pokemon = JSON.parse(item as string);
  const shouldPlayCaughtSound = JSON.parse(isFirstTime as string);
  const pokemonImagesRef = useRef<ICarouselInstance>(null);
  const caughtImagesRef = useRef<ICarouselInstance>(null);
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [crySound, setCrySound] = useState<Audio.Sound | null>(null);
  const [initSound, setInitSound] = useState<Audio.Sound | null>(null);
  const [caughtSound, setCaughtSound] = useState<Audio.Sound | null>(null);

  async function playCry() {
    const { sound } = await Audio.Sound.createAsync({
      uri: pokemon.cry,
    });

    setCrySound(sound);

    await sound.playAsync();
  }

  async function playInitSound() {
    if (pokemon.name === "pikachu" || pokemon.name === "eevee") {
      const { sound } = await Audio.Sound.createAsync(
        pokemon.name === "pikachu"
          ? require("@/assets/sound/pikachu.mp3")
          : require("@/assets/sound/eevee.mp3"),
      );

      setInitSound(sound);

      await sound.playAsync();
    } else {
      const { sound } = await Audio.Sound.createAsync({
        uri: pokemon.legacyCry ? pokemon.legacyCry : pokemon.cry,
      });

      setInitSound(sound);

      await sound.playAsync();
    }
  }

  async function playCaughtSound() {
    const { sound } = await Audio.Sound.createAsync(
      pokemon.isShiny
        ? require("@/assets/sound/shiny.mp3")
        : require("@/assets/sound/caught.mp3"),
    );

    setCaughtSound(sound);

    await sound.playAsync();
  }

  useFocusEffect(
    useCallback(() => {
      if (shouldPlayCaughtSound) {
        playCaughtSound();
      } else {
        playInitSound();
      }

      return () => {
        crySound?.unloadAsync();
        initSound?.unloadAsync();
        caughtSound?.unloadAsync();
      };
    }, []),
  );

  return (
    <>
      <StatusBar style="light" animated={true} translucent={true} />

      <AnimatedPressable
        style={{
          zIndex: 1000,
          position: "absolute",
          top: 25,
          left: 10,
        }}
        onPress={() => {
          Vibration.vibrate(50);

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
              entering={FadeInDown.duration(500).springify()}
            >
              {capitalizeFirstLetter(pokemon.name)}
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
                  entering={FadeInDown.duration(500).springify().delay(150)}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: "Regular",
                      color: theme.colors.white,
                    }}
                  >
                    {capitalizeFirstLetter(type)}
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
              height={350}
              width={Dimensions.get("screen").width}
              autoPlay={true}
              mode="parallax"
              ref={pokemonImagesRef}
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
                    height: 350,
                    width: Dimensions.get("screen").width,
                  }}
                  source={item}
                  transition={150}
                  contentFit="contain"
                  entering={FadeInDown.duration(500).springify().delay(300)}
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
                style={{
                  zIndex: 100000,
                }}
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
                  {capitalizeFirstLetter(section)}
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
                        .springify()
                        .delay(index * 100 + 450)}
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
                    playCry();
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
                    zoomLevel={18}
                    animationMode="flyTo"
                    animationDuration={3000}
                    defaultSettings={{
                      centerCoordinate:
                        pokemon.caughtLocation || DEFAULT_CAUGHT_LOCATION,
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
                  <Text
                    style={{
                      color: theme.colors.mutedBlack,
                    }}
                  >
                    Time:{" "}
                  </Text>
                  {formatISODate(pokemon.caughtDate).time}
                </Text>
                <Text
                  style={{
                    fontFamily: "Regular",
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.mutedBlack,
                    }}
                  >
                    Date:{" "}
                  </Text>
                  {formatISODate(pokemon.caughtDate).date}
                </Text>
              </Animated.View>

              <Carousel
                height={200}
                width={Dimensions.get("screen").width}
                autoPlay={pokemon.caughtImages.length > 1}
                style={{
                  marginBottom: 20,
                }}
                ref={caughtImagesRef}
                autoPlayInterval={3000}
                enabled={pokemon.caughtImages.length > 1}
                scrollAnimationDuration={1000}
                data={[...pokemon.caughtImages]}
                renderItem={({ item }) => (
                  <AnimatedImage
                    style={{
                      height: 200,
                      width: "90%",
                      borderRadius: 12,
                    }}
                    source={item}
                    transition={150}
                    contentFit="cover"
                    entering={FadeInDown.duration(500).springify().delay(300)}
                  />
                )}
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
