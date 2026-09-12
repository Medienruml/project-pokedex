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

    console.log(pokemonsResponseToJson);
    

    showPokemonCards(pokeGridContainer, pokemonsResponseToJson);

    offset += limit;
}

async function showPokemonCards(pokeGridContainer, pokemonsResponseToJson, ) {
    for(let pokemon of pokemonsResponseToJson.results) {
        let pokeUrl = pokemon.url;
        let pokemonResponse = await fetch(pokeUrl);
        let pokemonResponseToJson = await pokemonResponse.json();
        
        let pokeImgSrc = pokemonResponseToJson.sprites.other["official-artwork"].front_default || pokeResponseToJson.sprites.other.dream_world.front_default;
        let pokeNumber = pokemonResponseToJson.id;
        let pokeName = pokemonResponseToJson.name;
        pokeGridContainer.innerHTML += getPokemonCardTemplate(pokeImgSrc, pokeName, pokeNumber);

        let typesContainer = document.getElementById("poke-types-" + pokeNumber);
        let pokeTypes = pokemonResponseToJson.types;
        for(let pokeType of pokeTypes) {
            let type = pokeType.type.name;
            typesContainer.innerHTML += "<p class='type-" + type + "'>" + type + "</p>";
        }
    };
}

async function openDialog(event) {
    let pokeDialog = document.getElementById("pokemonDialog");
    pokeDialog.showModal();

    let pokemonNumber = event.currentTarget.dataset.pokenumber;
    let pokemonResponse = await fetch(BASE_URL + "pokemon/" + pokemonNumber);
    let pokemonResponseToJson = await pokemonResponse.json();

    pokeDialog.innerHTML = getPokemonDialog(pokemonResponseToJson);
    console.log(pokemonResponseToJson);
}

function closeDialog() {
    let pokeDialog = document.getElementById("pokemonDialog"); 
    pokeDialog.close();
}