

function init() {
    loadPokemon();
}

async function loadPokemon() {
    let pokeGridElement = document.getElementById("pokemonGrid");

    let response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=30&offset=0");
    let responseToJson = await response.json();

    responseToJson.results.forEach(async function getPokemon(pokemon) {
        let pokeUrl = await pokemon.url;
        let pokeResponse = await fetch(pokeUrl);
        let pokeResponseToJson = await pokeResponse.json();
        console.log(pokeResponseToJson);
        
        let pokeImgSrc = await pokeResponseToJson.sprites.other.dream_world.front_default;
        console.log(pokeImgSrc);
        
        let pokeNumber = await Number(pokeUrl.split("/").filter(Boolean).pop());
        let pokeName = await pokemon.name;
        pokeGridElement.innerHTML += getPokemonCardTemplate(pokeImgSrc, pokeName, pokeNumber);
    });;
       
}