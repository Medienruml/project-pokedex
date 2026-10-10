async function fetchPokemonList() {
    let pokemonsResponse = await fetch(BASE_URL + `pokemon?limit=${limit}&offset=${offset}`);
    let pokemonsResponseToJson = await pokemonsResponse.json();

    return pokemonsResponseToJson.results;
}


async function loadPokemonDetails(pokemonResults) {
    let pokemonPromises = pokemonResults.map(async (pokemon) => {
        let pokemonResponse = await fetch(pokemon.url);
        let pokemonData = await pokemonResponse.json();

        let pokemonNameGerman = await getTranscription(pokemonData.species.url, "de");

        return {
            ...pokemon, name: pokemonNameGerman, data: pokemonData
        };
    });

    return await Promise.all(pokemonPromises);
}


async function getPokemonObj(id) {
    let pokemon = await fetch(BASE_URL + "pokemon/" + id);
    let pokemonToJson = await pokemon.json();
    
    return pokemonToJson;
}


async function getPokemonSpeciesObj(value) {
    let url; 

    if (typeof value === "number") {
        url = BASE_URL + "pokemon-species/" + value;
    } else {
        url = value;
    }
    let pokemonSpecies = await fetch(url);
    let pokemonSpeciesToJson = await pokemonSpecies.json();
    
    return pokemonSpeciesToJson;
}


async function getEvolutionChainObj(pokemonSpeciesObj) {
    let pokemonEvolutionChainResponse = await fetch(pokemonSpeciesObj.evolution_chain.url);
    let pokemonEvolutionChainResoponseToJson = await pokemonEvolutionChainResponse.json();
    
    return pokemonEvolutionChainResoponseToJson;
}


async function getPokemonObjOverPokemonSpeciesUrl(pokemonSpeciesUrl) {
    let speciesObj = await getPokemonSpeciesObj(pokemonSpeciesUrl);
    let pokemonObj = await getPokemonObj(speciesObj.id);

    return pokemonObj;
}


async function getTranscription(url, language) {
    let cacheKey = `${url}-${language}`;

    if (transcriptionCache[cacheKey]) {
        return transcriptionCache[cacheKey];
    }

    transcriptionCache[cacheKey] = fetch(url)
        .then(response => response.json())
        .then(data => {
            let germanNameObj = data.names.find(name => name.language.name == language);
            
            return germanNameObj.name;
        });

    return await transcriptionCache[cacheKey];
}


async function getTypeTranslation(url, language) {
    if (typeTranslations[url]) {        
        return typeTranslations[url];
    }
    
    typeTranslations[url] = fetch(url)
        .then(response => response.json())
        .then(data => {
            let germanNameObj = data.names.find(name => name.language.name == language);
            return germanNameObj.name;
        });

    return await typeTranslations[url];
}


