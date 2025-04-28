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

    const evolutionChain = [];

    async function processEvolutionNode(node, level = 0) {
      const pokemonDetailsResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${node.species.name}`,
      );

      let pokemonImage = null;

      if (pokemonDetailsResponse.ok) {
        const pokemonDetails = await pokemonDetailsResponse.json();
        pokemonImage =
          pokemonDetails.sprites.other["official-artwork"].front_default;
      }

      let evolutionMethod = null;

      if (node.evolution_details && node.evolution_details.length > 0) {
        const detail = node.evolution_details[0];
        if (detail.min_level) {
          evolutionMethod = detail.min_level;
        } else if (detail.trigger?.name === "use-item") {
          evolutionMethod = `Use ${detail.item?.name}`;
        } else if (detail.trigger?.name === "trade") {
          evolutionMethod = "Trade";
        } else if (detail.trigger?.name === "level-up") {
          if (detail.time_of_day) {
            evolutionMethod = `Level up during ${detail.time_of_day}`;
          } else if (detail.min_happiness) {
            evolutionMethod = `Happiness ≥ ${detail.min_happiness}`;
          } else {
            evolutionMethod = "Level up";
          }
        } else {
          evolutionMethod = "Special";
        }
      }

      evolutionChain.push({
        name: node.species.name,
        image: pokemonImage,
        evolutionMethod: evolutionMethod,
      });

      if (node.evolves_to && node.evolves_to.length > 0) {
        for (const evolution of node.evolves_to) {
          await processEvolutionNode(evolution, level + 1);
        }
      }
    }

    await processEvolutionNode(evolutionData.chain);

    const encounterResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonData.id}/encounters`,
    );
    let locations = [];

    if (encounterResponse.ok) {
      const encounterData = await encounterResponse.json();
      locations = encounterData.map(
        (encounter) => encounter.location_area.name,
      );
    }

    const englishDescriptions = speciesData.flavor_text_entries
      .filter((entry) => entry.language.name === "en")
      .map((entry) => entry.flavor_text.replace(/\f/g, " ").replace(/\n/g, " "))
      .filter((text, index, self) => self.indexOf(text) === index);

    const extraImages = [];
    const spriteSources = [
      pokemonData.sprites.other.dream_world?.front_default,
      pokemonData.sprites.other.home?.front_default,
      pokemonData.sprites.other.showdown?.front_default,
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
      evolutions: evolutionChain,
      types: pokemonData.types.map((t) => t.type.name),
      height: pokemonData.height,
      weight: pokemonData.weight,
      stats: stats,
      locations: locations,
      color:
        POKEMON_TYPES_WITH_COLORS[pokemonData.types[0].type.name] || "#FFFFFF",
      is_shiny: false,
      is_caught: false,
    };
  } catch (error) {
    console.warn(`Skipping ${nameOrId} due to insufficient details:`, error);
    return null;
  }
}

async function catchAllPokemon() {
  let page = 1;
  let allPokemons = [];
  let url = "https://pokeapi.co/api/v2/pokemon/";

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
