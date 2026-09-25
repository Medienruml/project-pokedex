const BASE_URL = "https://pokeapi.co/api/v2/"

let limit = 150;
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

    let pokeNumber = Number(event.currentTarget.dataset.pokenumber);
    let pokemonResponseToJson = await getPokemonObj(pokeNumber);
    let pokemonSpeciesResponseToJson = await getPokemonSpeciesObj(pokeNumber);

    pokeDialog.innerHTML = await getPokemonDialogTemplate(pokemonResponseToJson, pokemonSpeciesResponseToJson);
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
    let pokeSpeciesToJson = await getPokemonSpeciesObj(pokeNumber);

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


function getEvolutionChain(chain) {
    let evolution = {
        speciesUrl: chain.species.url,
        evolvesTo: []
    };

    for (const nextEvolutionUrl of chain.evolves_to) {
        evolution.evolvesTo.push(
            getEvolutionChain(nextEvolutionUrl)
        )
    }    

    return evolution;
}

async function showPokeEvolutionChain(evolutionChain) {    
    let html = `<div class="evolution-row">`;
    let currentChain = evolutionChain;

    while (currentChain) {
        let pokemonObj = await getPokemonObjOverPokemonSpeciesUrl(currentChain.speciesUrl);

        html += getPokemonThumbnailTemplate(pokemonObj);

        if (isEvolvesToEmpty(currentChain)) {
            break
        };

        html += getRightArrowTemplate();

        if (currentChain.evolvesTo.length > 1) {
            for (nextEvolution of current.evolvesTo) {
                let nextPokemonObj = await getPokemonObjOverPokemonSpeciesUrl(nextEvolution.speciesUrl);
                
                html += getPokemonThumbnailTemplate(nextPokemonObj);
            }
            break;
        }

        currentChain = currentChain.evolvesTo[0];
    }

    html += `</div>`;

    return html;
}

function isEvolvesToEmpty(current) {
    return current.evolvesTo.length === 0;
}

function isEvolvesToGreaterThanOne(current) {

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

async function getEvolutionChainObj(id) {
    let pokemonSpeciesToJson = await getPokemonSpeciesObj(id);
    let pokemonEvolutionChain = await fetch(pokemonSpeciesToJson.evolution_chain.url);
    let pokemonEvolutionChainToJson = await pokemonEvolutionChain.json();

    console.log(pokemonEvolutionChainToJson);
    
    return pokemonEvolutionChainToJson;
}

async function getPokemonObjOverPokemonSpeciesUrl(pokemonSpeciesUrl) {
    let speciesObj = await getPokemonSpeciesObj(pokemonSpeciesUrl);
    let pokemonObj = await getPokemonObj(speciesObj.id);

    return pokemonObj;
}
