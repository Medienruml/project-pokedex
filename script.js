const BASE_URL = "https://pokeapi.co/api/v2/"

let limit = 30;
let offset = 0;

function init() {
    offset = 0;
    loadPokemon();
}

async function loadPokemon() {
    let pokeGridContainer = document.getElementById("pokemonGrid");

    let pokemonsResponse = await fetch(BASE_URL + `pokemon?limit=${limit}&offset=${offset}`);
    let pokemonsResponseToJson = await pokemonsResponse.json();

    showPokemonCards(pokeGridContainer, pokemonsResponseToJson);

    offset += limit;
}

async function showPokemonCards(pokeGridContainer, pokemonsResponseToJson,) {
    for (let pokemon of pokemonsResponseToJson.results) {
        let pokeUrl = pokemon.url;
        let pokemonResponse = await fetch(pokeUrl);
        let pokemonResponseToJson = await pokemonResponse.json();

        let pokeImgSrc = pokemonResponseToJson.sprites.other["official-artwork"].front_default || pokeResponseToJson.sprites.other.dream_world.front_default;
        let pokeNumber = pokemonResponseToJson.id;
        let pokeName = pokemonResponseToJson.name;
        let pokeNameGerman = await getTranscription(pokemonResponseToJson.species.url, "de");
        pokeGridContainer.innerHTML += getPokemonCardTemplate(pokeImgSrc, pokeNameGerman, pokeNumber);


        let typesContainer = document.getElementById("poke-types-" + pokeNumber);
        typesContainer.innerHTML += await showPokeTypes(pokemonResponseToJson);
    };
}

async function openDialog(event) {
    let pokeDialog = document.getElementById("pokemonDialog");
    pokeDialog.showModal();

    let pokemonNumber = event.currentTarget.dataset.pokenumber;
    let pokemonResponse = await fetch(BASE_URL + "pokemon/" + pokemonNumber);
    let pokemonResponseToJson = await pokemonResponse.json();

    pokeDialog.innerHTML = await getPokemonDialogTemplate(pokemonResponseToJson);
}

function closeDialogBtn() {
    let pokeDialog = document.getElementById("pokemonDialog");
    pokeDialog.close();
}

function closeDialog(event) {    
    if (event.target === pokemonDialog) {
        pokemonDialog.close();
    }
}

async function getTranscription(url, language) {
    let response = await fetch(url);
    let data = await response.json();

    let germanName = data.names.find(name => name.language.name == language);

    return germanName.name;
}

async function showPokeTypes(pokedata) {
    let pokeTypes = pokedata.types;

    let html = "";

    for (let pokeType of pokeTypes) {
        let typeName = pokeType.type.name;
        let typeNameGerman = await getTranscription(pokeType.type.url, "de");

        html += "<p class='type-" + typeName + "'>" + typeNameGerman + "</p>";
    }

    return html;
}

async function showAbilities(pokedata) {
    let pokeAbilities = pokedata.abilities;

    let html = "";

    for (let pokeAbility of pokeAbilities) {
        if (pokeAbility.is_hidden == false) {
            let abilityName = pokeAbility.ability.name;
            let abilityGermanName = await getTranscription(pokeAbility.ability.url, "de");

            html += "<li class='ability'>" + abilityGermanName + "</li>";
        }
    }

    return html;
}

async function showFlavorText(pokedata) {
    let html = "";
    let pokeNumber = pokedata.id;
    let pokeSpeciesToJson = await getPokemonSpecies(pokeNumber);

    let germanFlavorObject = pokeSpeciesToJson.flavor_text_entries.find(flavorText => flavorText.language.name == "de");
    let germanFlavorText = germanFlavorObject.flavor_text;

    html += "<p class='detailDescription'>" + germanFlavorText + "</p>";
    
    return html;
}

async function showPokeStats(pokedata) {
    let html = "";
    let statsGermanNames = ["KP","Angriff","Vert.","Sp.-Ang.","Sp.-Vert.","Initiative"]
    let pokeStats = pokedata.stats;

    for (let index = 0; index < pokeStats.length; index++) {
        let stat = pokeStats[index];
        html += `<tr> <td class="stat-name">${statsGermanNames[index]}</td><td><progress class='stat-${stat.stat.name}' value='${stat.base_stat}' max='255'>${stat.base_stat}</progress></td><td class="stat-value">${stat.base_stat}</td> </tr>`;
    }
    
    return html;
}

async function showPokeEvoChain(pokedata) {
    let html = "";
    let pokeNumber = pokedata.id;
    let pokeEvoChainToJson = await getEvoChain(pokeNumber);
    let pokeEvoChain = pokeEvoChainToJson.chain;

    let urls = getSpeciesUrls(pokeEvoChain);
    for ([index, url] of urls.entries()) {
        let pokemonSpeciesToJson = await getPokemonSpecies(url);
        let pokemonToJson = await getPokemon(pokemonSpeciesToJson.id);
        
        if (index != 0) {
            html += `
                <img class="arrow" src="./assets/icons/icon-arrow-line-right.svg" alt="arrow right"/>
            `;
        } else {}
        html += `
            <img 
                src="${pokemonToJson.sprites.versions['generation-iv'].platinum.front_default}" 
                alt="${pokemonToJson.id}_${pokemonToJson.name}"
            />
        `;
    };

    return html; 
}

async function getEvoChain(id) {
    let pokemonSpeciesToJson = await getPokemonSpecies(id);
    let pokemonEvolutionChain = await fetch(pokemonSpeciesToJson.evolution_chain.url);
    let pokemonEvolutionChainToJson = await pokemonEvolutionChain.json();

    return pokemonEvolutionChainToJson;
}

async function getPokemon(id) {
    let pokemon = await fetch(BASE_URL + "pokemon/" + id);
    let pokemonToJson = await pokemon.json();
    
    return pokemonToJson;
}

async function getPokemonSpecies(value) {
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

function getSpeciesUrls(evolution) {
    let urls = [evolution.species.url];

    evolution.evolves_to.forEach(nextEvolution => {
        urls.push(...getSpeciesUrls(nextEvolution));
    });

    return urls;
}
