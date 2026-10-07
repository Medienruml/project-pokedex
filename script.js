const BASE_URL = "https://pokeapi.co/api/v2/"

let limit = 30;
let offset = 0;
let currentPokemonNumber = 0;

let pokemonList = [];
let filteredPokemonList = [];
let sortType = "number-asc";

let typeTranslations = {};


function init() {
    offset = 0;
    loadPokemon();
    let loadMorePokemonButton = document.getElementById("loadMorePokemonButton");
    loadMorePokemonButton.innerHTML = getLoadButtonTemplate(limit);
}


async function loadPokemon() {
    let pokemonGrid = document.getElementById("pokemonGrid");
    let pokemonCounter = document.getElementById("pokemonCounter");
    let loadMorePokemonButton = document.getElementById("loadMorePokemonButton");
    let searchInputElement = document.getElementById("searchPokemon");

    loadMorePokemonButton.disabled = true;

    try{
        let pokemonsResponse = await fetch(BASE_URL + `pokemon?limit=${limit}&offset=${offset}`);
        let pokemonsResponseToJson = await pokemonsResponse.json();        

        generateLoaderImages(pokemonsResponseToJson.results, pokemonGrid);

        let pokemonPromises = pokemonsResponseToJson.results.map(async (pokemon) => {
            let pokemonResponse = await fetch(pokemon.url);
            let pokemonData = await pokemonResponse.json();

            let pokemonNameGerman = await getTranscription(pokemonData.species.url, "de");

            return {
                ...pokemon, name: pokemonNameGerman, data: pokemonData
            };
        })

        let loadedPokemons = await Promise.all(pokemonPromises);
        
        pokemonList.push(...loadedPokemons);
        filteredPokemonList = [...pokemonList];

        searchInputElement.value = "";
        searchInputElement.setAttribute("placeholder", "Finde dein Pokémon");

        pokemonCounter.innerHTML = getPokemonCounterTemplate(offset + limit);
        offset += limit;

        showPokemonCards(filteredPokemonList);
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon.", error);
    } finally {
        loadMorePokemonButton.disabled = false;
    }
}


function generateLoaderImages(pokemonData, pokemonGrid) {
    for ( let pokemon of pokemonData ) {
            let pokemonNumber = getPokemonNumber(pokemon.url);
            pokemonGrid.insertAdjacentHTML("beforeend", getPokemonCardLoaderTemplate(pokemonNumber));
        }
}


function getPokemonNumber(url) {
    return Number(url.split("/").at(-2));
}


function sortPokemon(newSortType) {
    sortType = newSortType;
    let sortedPokemon = [...filteredPokemonList];

    switch (sortType) {
        case "number-asc": sortedPokemon.sort((a, b) => {return a.data.id - b.data.id;});
            break;
        case "number-desc": sortedPokemon.sort((a, b) => {return b.data.id - a.data.id;});
            break;
        case "name-asc": sortedPokemon.sort((a, b) => {return a.name.localeCompare(b.name);});
            break;
        case "name-desc": sortedPokemon.sort((a, b) => {return b.name.localeCompare(a.name);});
            break;
    }

    filteredPokemonList = sortedPokemon;

    let pokeGridContainer = document.getElementById("pokemonGrid");
    pokeGridContainer.innerHTML = ""; 

    showPokemonCards(filteredPokemonList);
}


async function showPokemonCard(pokemon) {
    let pokemonData = pokemon.data;
    let pokemonNumber = pokemonData.id;

    let pokeImgSrc = pokemonData.sprites.other["official-artwork"].front_default || pokemonData.sprites.other.dream_world.front_default;
    let pokemonCard = document.getElementById("pokemon-card-" + pokemonNumber);
    pokemonCard.outerHTML = getPokemonCardTemplate(pokeImgSrc, pokemon.name, pokemonNumber);

    let typesContainer = document.getElementById("poke-types-" + pokemonNumber);
    typesContainer.innerHTML = await showPokeTypes(pokemonData);
}


function showPokemonCards(pokemonList) {
    let pokeGridContainer = document.getElementById("pokemonGrid");
    pokeGridContainer.innerHTML = "";

    for (let pokemon of pokemonList) {
        let pokemonData = pokemon.data;

        let pokeImgSrc = pokemonData.sprites.other["official-artwork"].front_default || pokemonData.sprites.other.dream_world.front_default;
        let pokeNumber = pokemonData.id;
        pokeGridContainer.insertAdjacentHTML("beforeend", getPokemonCardTemplate(pokeImgSrc, pokemon.name, pokeNumber));

        let typesContainer = document.getElementById("poke-types-" + pokeNumber);

        showPokeTypes(pokemonData).then(types => {
            typesContainer.innerHTML = types;
        });
    };
}


function searchPokemonList() {
    let searchInputElement = document.getElementById("searchPokemon");
    let searchValue = searchInputElement.value.toLowerCase().trim();

    if(searchValue.length > 0 && searchValue.length < 3) {
        searchInputElement.value = "";
        searchInputElement.setAttribute("placeholder", "min. 3 Zeichen");
        return
    } 
    
    if (searchValue.length == 0) {
        filteredPokemonList = [...pokemonList];
    } else {
        filteredPokemonList = pokemonList.filter(pokemon => {
            return pokemon.name.toLowerCase().includes(searchValue);
        });

        searchInputElement.value = "";
        searchInputElement.setAttribute("placeholder", "Finde dein Pokémon");
    }

    let pokemonGridContainer = document.getElementById("pokemonGrid");

    if (filteredPokemonList.length == 0) {
        pokemonGridContainer.innerHTML = getNotFoundTemplate();
    } else {
        sortPokemon(sortType);
    }
}


async function showDialogContent(pokemonNumber) {
    let pokeDialog = document.getElementById("pokemonDialog");

    let pokemonResponseToJson = await getPokemonObj(pokemonNumber);
    let pokemonSpeciesResponseToJson = await getPokemonSpeciesObj(pokemonNumber);

    pokeDialog.innerHTML = await getPokemonDialogTemplate(pokemonResponseToJson, pokemonSpeciesResponseToJson);
}


async function openDialog(event) {
    let pokeNumber = Number(event.currentTarget.dataset.pokenumber);
    currentPokemonNumber = pokeNumber;
    let pokeDialog = document.getElementById("pokemonDialog");
    pokeDialog.showModal();

    showDialogContent(pokeNumber);
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


async function showPokeTypes(pokedata) {
    let pokeTypes = pokedata.types;

    let html = "";

    for (let pokeType of pokeTypes) {
        let typeName = pokeType.type.name;
        let typeNameGerman = await getTypeTranslation(pokeType.type.url, "de");

        html += `<p class="type-${typeName}">${typeNameGerman}</p>`;
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
        html += `
            <tr> 
                <td class="stat-name">${statsGermanNames[index]}</td>
                <td><progress class='stat-${stat.stat.name}' value='${stat.base_stat}' max='255'>${stat.base_stat}</progress></td>
                <td class="stat-value">${stat.base_stat}</td> 
            </tr>
            
        `;
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
            for (let nextEvolution of currentChain.evolvesTo) {
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
    
    return pokemonEvolutionChainToJson;
}


async function getPokemonObjOverPokemonSpeciesUrl(pokemonSpeciesUrl) {
    let speciesObj = await getPokemonSpeciesObj(pokemonSpeciesUrl);
    let pokemonObj = await getPokemonObj(speciesObj.id);

    return pokemonObj;
}


async function showPrevPokemon(pokemonNumber) {    
    let currentIndex = filteredPokemonList.findIndex(
        pokemon => getPokemonNumber(pokemon.url) === pokemonNumber
    );

    if (currentIndex === 0) {
        currentIndex = filteredPokemonList.length;
    } 

    let prevPokemon = filteredPokemonList[currentIndex - 1];
    let prevPokemonId = getPokemonNumber(prevPokemon.url);

    showDialogContent(prevPokemonId);
}


async function showNextPokemon(pokemonNumber) {
    let currentIndex = filteredPokemonList.findIndex(
        pokemon => getPokemonNumber(pokemon.url) === pokemonNumber
    )

    if (currentIndex === filteredPokemonList.length - 1) {
        currentIndex = -1;
    }  

    let nextPokemon = filteredPokemonList[currentIndex + 1];
    let nextPokemonId = getPokemonNumber(nextPokemon.url);

    showDialogContent(nextPokemonId);
}


function keyNavigation(event) {
    if(event.key === "ArrowLeft") {
        showPrevPokemon(currentPokemonNumber);
        currentPokemonNumber--;
    }

    if(event.key === "ArrowRight") {
        showNextPokemon(currentPokemonNumber);
        currentPokemonNumber++;
    }
}