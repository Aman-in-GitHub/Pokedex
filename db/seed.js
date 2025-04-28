import fs from "fs";
import { POKEMON_TYPES_WITH_COLORS } from "../lib/constants";

async function fetchPokemonDetails(nameOrId) {
  try {
    const pokemonResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${nameOrId}`,
    );
    if (!pokemonResponse.ok) throw new Error("Failed to fetch Pokemon data");
    const pokemonData = await pokemonResponse.json();

    const speciesResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${nameOrId}`,
    );
    if (!speciesResponse.ok)
      throw new Error("Failed to fetch Pokemon species data");
    const speciesData = await speciesResponse.json();

    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    if (!evolutionResponse.ok)
      throw new Error("Failed to fetch evolution data");
    const evolutionData = await evolutionResponse.json();

    const evolutions = [];
    let current = evolutionData.chain;
    while (current) {
      evolutions.push(current.species.name);
      current = current.evolves_to[0];
    }

    const englishDescriptions = speciesData.flavor_text_entries
      .filter((entry) => entry.language.name === "en")
      .map((entry) => entry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " "))
      .filter((text, index, self) => self.indexOf(text) === index);

    const extraImages = [];

    const spriteSources = [
      pokemonData.sprites.other.dream_world?.front_default,
      pokemonData.sprites.other.home?.front_default,
      pokemonData.sprites.other.showdown?.back_default,
    ];

    for (const url of spriteSources) {
      if (url) {
        extraImages.push(url);
      }
    }

    const stats = pokemonData.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {});

    return {
      id: pokemonData.id,
      name: pokemonData.name,
      description: englishDescriptions,
      generation: speciesData.generation.name,
      cry: pokemonData.cries.latest,
      legacy_cry: pokemonData.cries.legacy,
      image: pokemonData.sprites.other["official-artwork"].front_default,
      shiny: pokemonData.sprites.other["official-artwork"].front_shiny,
      extra_images: extraImages,
      evolutions: evolutions,
      types: pokemonData.types.map((t) => t.type.name),
      height: pokemonData.height,
      weight: pokemonData.weight,
      stats: stats,
      color:
        POKEMON_TYPES_WITH_COLORS[pokemonData.types[0].type.name] || "#FFFFFF",
      is_unlocked: false,
    };
  } catch (error) {
    console.warn(`Skipping ${nameOrId} due to insufficient details:`, error);
    return null;
  }
}

async function catchAllPokemon() {
  let allPokemons = [];
  let url = "https://pokeapi.co/api/v2/pokemon/";
  let page = 1;

  console.log("Started catching pokemons...");

  while (url) {
    const response = await fetch(url);
    const data = await response.json();

    const detailPromises = data.results.map((pokemon) =>
      fetchPokemonDetails(pokemon.name),
    );
    const pokemons = await Promise.all(detailPromises);

    const successfulCatches = pokemons.filter((pokemon) => pokemon !== null);

    allPokemons.push(...successfulCatches);

    url = data.next;

    console.log(`Page: ${page} | Pokemons: ${allPokemons.length}`);

    page++;
  }

  console.log(
    `All regions explored. Total Pokémon caught: ${allPokemons.length}`,
  );

  fs.writeFileSync("./assets/seed.json", JSON.stringify(allPokemons, null, 2));
}

catchAllPokemon();
