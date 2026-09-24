function getPokemonCardTemplate(src, name, number) {
    return `
        <article data-pokenumber="${number}" class="pokemon-card" onclick="openDialog(event)">
            <img class="poke-image" src="${src}" alt="" />
            <p class="poke-number">#${number}</p>
            <p class="poke-name">${name}</p>
            <div class="poke-types" id="poke-types-${number}">

            </div>
        </artice>
    `;
}

async function getPokemonDialogTemplate(pokedata) {
    let pokeTypesHtml = await showPokeTypes(pokedata);

    let pokeAbilitiesHtml = await showAbilities(pokedata);

    let pokeNameGerman = await getTranscription(BASE_URL + "pokemon-species/" + pokedata.id, "de");
    let pokeNameJapanese = await getTranscription(BASE_URL + "pokemon-species/" + pokedata.id, "ja")

    let pokeFlavorTextHtml = await showFlavorText(pokedata);

    let pokeStatsHtml = await showPokeStats(pokedata);

    let pokeEvoChainHtml = await showPokeEvoChain(pokedata);

    return `
        <button onclick="closeDialogBtn()" class="dialog-close" id="closeDialog"></button>

        <button class="pokemon-navigation previous" id="previousPokemon"></button>

        <div class="pokemon-details">
            <section class="details-content-1">
                <div>
                    <span id="detailNumber">#${pokedata.id}</span>
                    <h2 id="detailName">${pokeNameGerman}</h2>
                    <p>${pokeNameJapanese}</p>
                </div>

                <div id="detailTypes">${pokeTypesHtml}</div>

                <div class="basic-info">
                    <div>
                        <p>Größe:</p>
                        <p id="detailHeight">${(pokedata.height) / 10}m</p>
                    </div>

                    <div>
                        <p>Gewicht:</p>
                        <p id="detailWeight">${(pokedata.weight) / 10}kg</p>
                    </div>

                </div>

                <div class="abilities">
                    <h3>Fähigkeiten</h3>

                    <ul id="detailAbilities">
                        ${pokeAbilitiesHtml}
                    </ul>
                </div>
            </section>

            <section class="details-content-2">
                <img id="detailImage" src="${pokedata.sprites.other["official-artwork"].front_default || pokedata.sprites.other.dream_world.front_default}" alt="">
                <div class="evolution-section">

                    <h3>Entwicklungen</h3>

                    <div id="evolutionChain" class="evolution-chain">
                        ${pokeEvoChainHtml}
                    </div>

                </div>
            </section>

            <section class="details-content-3">
                <div class="description-section">
                    <h3>Beschreibung</h3>
                    ${pokeFlavorTextHtml}
                </div>

                <div class="stats-section">
                    <h3>Statuswerte</h3>
                    <div id="detailStats" class="stats">
                        <table>
                            ${pokeStatsHtml}
                        </table>
                    </div>
                </div>
            </section>

        </div>


        <button class="pokemon-navigation next" id="nextPokemon"></button>
    `;
}