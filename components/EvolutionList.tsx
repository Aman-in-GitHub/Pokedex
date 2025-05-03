import { eq } from "drizzle-orm";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, Text, ToastAndroid, Vibration, View } from "react-native";

import { db } from "@/db";
import * as schema from "@/db/schema/index";
import ArrowIcon from "@/assets/icons/Arrow.svg";
import { capitalizeFirstLetter } from "@/lib/utils";

type EvolutionType = {
  id: number;
  name: string;
  image: string;
  evolutionMethod: string;
};

export default function EvolutionList({
  color,
  firstPokemon,
  secondPokemon,
}: {
  color: string;
  firstPokemon: EvolutionType;
  secondPokemon: EvolutionType;
}) {
  async function handleEvolutionPress(pokemon: EvolutionType) {
    const pokemonData = await db
      .select()
      .from(schema.pokemons)
      .where(eq(schema.pokemons.id, pokemon.id));

    const isCaught = pokemonData[0].isCaught;

    if (isCaught) {
      router.navigate({
        pathname: "/detail",
        params: { item: JSON.stringify(pokemonData[0]) },
      });
    } else {
      Vibration.vibrate(100);

      ToastAndroid.show("Pokémon not caught yet", ToastAndroid.SHORT);
    }
  }

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Pressable
        style={{ alignItems: "center" }}
        onPress={() => {
          handleEvolutionPress(firstPokemon);
        }}
      >
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
          {capitalizeFirstLetter(firstPokemon.name)}
        </Text>
      </Pressable>

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

      <Pressable
        style={{ alignItems: "center" }}
        onPress={() => {
          handleEvolutionPress(secondPokemon);
        }}
      >
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
          {capitalizeFirstLetter(secondPokemon.name)}
        </Text>
      </Pressable>
    </View>
  );
}
