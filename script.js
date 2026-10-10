const BASE_URL = "https://pokeapi.co/api/v2/"

let limit = 30;
let offset = 0;
let currentPokemonNumber = 0;

let pokemonList = [];
let filteredPokemonList = [];
let sortType = "number-asc";

let typeTranslations = {};
let transcriptionCache = {};


function init() {
    offset = 0;
    loadPokemon();
    let loadMorePokemonButton = document.getElementById("loadMorePokemonButton");
    loadMorePokemonButton.innerHTML = getLoadButtonTemplate(limit);
}


async function loadPokemon() {
    showLoadingOverlay();
    let loadMorePokemonButton = document.getElementById("loadMorePokemonButton");
    loadMorePokemonButton.disabled = true;

    try{
        let pokemonResults = await fetchPokemonList();
        generateLoaderImages(pokemonResults, document.getElementById("pokemonGrid"));
        let loadedPokemons = await loadPokemonDetails(pokemonResults);
        updatePokemonList(loadedPokemons);
        updatePokemonCounter();
        showPokemonCards(filteredPokemonList);
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon.", error);
    } finally {
        loadMorePokemonButton.disabled = false;
        hideLoadingOverlay();
    }
}


function updatePokemonList(loadedPokemons) {
    pokemonList.push(...loadedPokemons);
    filteredPokemonList = [...pokemonList];

    let searchInputElement = document.getElementById("searchPokemon");
    searchInputElement.value = "";
    searchInputElement.setAttribute("placeholder", "Finde dein Pokémon");
}


function updatePokemonCounter() {
    let pokemonCounter = document.getElementById("pokemonCounter");

    pokemonCounter.innerHTML = getPokemonCounterTemplate(offset + limit);
    offset += limit;
}


async function getPokeTypesHTML(pokedata) {
    let pokeTypes = pokedata.types;

    let html = "";

    for (let pokeType of pokeTypes) {
        let typeName = pokeType.type.name;
        let typeNameGerman = await getTypeTranslation(pokeType.type.url, "de");

        html += `<p class="type-${typeName}">${typeNameGerman}</p>`;
    }

    return html;
}


async function getAbilitiesHTML(pokemonData) {
    let pokeAbilities = pokemonData.abilities;

    let html = "";

    for (let pokeAbility of pokeAbilities) {
        if (pokeAbility.is_hidden == false) {
            let abilityGermanName = await getTranscription(pokeAbility.ability.url, "de");

            html += "<li class='ability'>" + abilityGermanName + "</li>";
        }
    }

    return html;
}


async function getFlavorTextHTML(pokemonSpeciesData) {
    let html = "";

    let germanFlavorObject = pokemonSpeciesData.flavor_text_entries.find(flavorText => flavorText.language.name == "de");
    let germanFlavorText = germanFlavorObject.flavor_text;

    html += "<p class='detailDescription'>" + germanFlavorText + "</p>";
    
    return html;
}


async function getPokemonStatsHTML(pokemonData) {
    let html = "";
    let statsGermanNames = ["KP","Angriff","Vert.","Sp.-Ang.","Sp.-Vert.","Initiative"]
    let pokeStats = pokemonData.stats;

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


function showLoadingOverlay() {
    let loadingOverlayElement = document.getElementById("loadingOverlay");

    loadingOverlayElement.style.display = "flex";
}


function hideLoadingOverlay() {
    let loadingOverlayElement = document.getElementById("loadingOverlay");

    loadingOverlayElement.style.display = "none";
}