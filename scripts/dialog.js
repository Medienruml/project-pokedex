async function showDialogContent(pokemonDialogElement, pokemonNumber) {
    let pokemonResponseToJson = await getPokemonObj(pokemonNumber);
    let pokemonSpeciesResponseToJson = await getPokemonSpeciesObj(pokemonNumber);

    pokemonDialogElement.innerHTML = await getPokemonDialogTemplate(pokemonResponseToJson, pokemonSpeciesResponseToJson);
}


async function openDialog(event) {
    let pokeNumber = Number(event.currentTarget.dataset.pokenumber);
    currentPokemonNumber = pokeNumber;
    let pokemonDialogElement = document.getElementById("pokemonDialog");

    pokemonDialogElement.innerHTML = getDialogLoaderTemplate();
    pokemonDialogElement.showModal();

    await showDialogContent(pokemonDialogElement, pokeNumber);
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


async function getPokemonEvolutionChainHTML(evolutionChain) {    
    let html = `<div class="evolution-row">`;
    let currentChain = evolutionChain;
    while (currentChain) {
        html += await getEvolutionPokemonHtml(currentChain.speciesUrl);
        if (isEvolvesToEmpty(currentChain)) {break;}
        html += getRightArrowTemplate();
        if (currentChain.evolvesTo.length > 1) {
            html += await getMultipleEvolutionHTML(currentChain.evolvesTo);
            break;
        }
        currentChain = currentChain.evolvesTo[0];
    }
    html += `</div>`;
    return html;
}


async function getEvolutionPokemonHtml(speciesUrl) {
    let pokemonObj = await getPokemonObjOverPokemonSpeciesUrl(speciesUrl);

    return getPokemonThumbnailTemplate(pokemonObj);
}


async function getMultipleEvolutionHTML(evolutions) {
    let html = "";
    for (let evolution of evolutions) {
        html += await getEvolutionPokemonHtml(evolution.speciesUrl);
    }
    return html;
}


function isEvolvesToEmpty(current) {
    return current.evolvesTo.length === 0;
}


async function showPrevPokemon(pokemonNumber) {   
    let pokemonDialogElement = document.getElementById("pokemonDialog"); 
    let currentIndex = filteredPokemonList.findIndex(
        pokemon => pokemon.data.id === pokemonNumber
    );

    if (currentIndex === 0) {
        currentIndex = filteredPokemonList.length;
    } 

    let prevPokemon = filteredPokemonList[currentIndex - 1];
    let prevPokemonId = prevPokemon.data.id;

    showDialogContent(pokemonDialogElement, prevPokemonId);
}


async function showNextPokemon(pokemonNumber) {
    let pokemonDialogElement = document.getElementById("pokemonDialog"); 
    let currentIndex = filteredPokemonList.findIndex(
        pokemon => pokemon.data.id === pokemonNumber
    )

    if (currentIndex === filteredPokemonList.length - 1) {
        currentIndex = -1;
    }  

    let nextPokemon = filteredPokemonList[currentIndex + 1];
    let nextPokemonId = nextPokemon.data.id;
    
    showDialogContent(pokemonDialogElement, nextPokemonId);
}