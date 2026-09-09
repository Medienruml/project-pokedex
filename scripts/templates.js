function getPokemonCardTemplate(src, name, number) {
    return  `
        <article class="pokemon-card" onclick="openDialog(event)">
            <img class="poke-image" src="${src}" alt="" />
            <p class="poke-number">#${number}</p>
            <p class="poke-name">${name}</p>
            <div class="poke-types">

            </div>
        </artice>
    `;
}