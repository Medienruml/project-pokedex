function generateLoaderImages(pokemonData, pokemonGrid) {
    for ( let pokemon of pokemonData ) {
            let pokemonNumber = getPokemonNumber(pokemon.url);
            pokemonGrid.insertAdjacentHTML("beforeend", getPokemonCardLoaderTemplate(pokemonNumber));
        }
}


function getPokemonNumber(url) {
    return Number(url.split("/").at(-2));
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

        getPokeTypesHTML(pokemonData).then(types => {
            typesContainer.innerHTML = types;
        });
    };
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
    showPokemonCards(filteredPokemonList);
}


function searchPokemonList() {
    let searchInputElement = document.getElementById("searchPokemon");
    let searchValue = searchInputElement.value.toLowerCase().trim();

    if (!validateSearchInput(searchValue, searchInputElement)) {
        return;
    }

    filterPokemonList(searchValue);
    resetSearchInput(searchInputElement, searchValue);
    displaySearchResults();    

    toggleLoadAndResetButton();
}


function toggleLoadAndResetButton() {
    let loadMorePokemonButtonElement = document.getElementById("loadMorePokemonButton");
    let resetSearchButton = document.getElementById("resetSearchBtn");
    if (filteredPokemonList.length < pokemonList.length) {
        loadMorePokemonButtonElement.setAttribute("style", "display: none");
        resetSearchButton.setAttribute("style", "display: block");
    } else {
        loadMorePokemonButtonElement.setAttribute("style", "display: block");
        resetSearchButton.setAttribute("style", "display: none");
    }
}


function validateSearchInput(searchValue, searchInputElement) {
    if(searchValue.length > 0 && searchValue.length < 3) {
        searchInputElement.value = "";
        searchInputElement.setAttribute("placeholder", "min. 3 Zeichen");
        return false;
    } 

    return true;
}


function filterPokemonList(searchValue) {
    if (searchValue.length === 0) {
        filteredPokemonList = [...pokemonList];
        return;
    }

    filteredPokemonList = pokemonList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchValue)
    );
}


function resetSearch() {
    filteredPokemonList = [...pokemonList];
    displaySearchResults(); 

    toggleLoadAndResetButton();
}


function resetSearchInput(searchInputElement, searchValue) {
   if (searchValue.length > 0) {
        searchInputElement.value = "";
        searchInputElement.setAttribute("placeholder", "Finde dein Pokémon");
    }
}


function displaySearchResults() {
    let pokemonGridContainer = document.getElementById("pokemonGrid");

    if (filteredPokemonList.length === 0) {
        pokemonGridContainer.innerHTML = getNotFoundTemplate();
        return;
    }

    sortPokemon(sortType);
}


