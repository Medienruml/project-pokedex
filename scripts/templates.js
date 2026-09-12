function getPokemonCardTemplate(src, name, number) {
    return  `
        <article data-pokenumber="${number}" class="pokemon-card" onclick="openDialog(event)">
            <img class="poke-image" src="${src}" alt="" />
            <p class="poke-number">#${number}</p>
            <p class="poke-name">${name}</p>
            <div class="poke-types" id="poke-types-${number}">

            </div>
        </artice>
    `;
}

function getPokemonDialog(pokedata) {
    return `
        <button onclick="closeDialog()" class="dialog-close" id="closeDialog">
            ×
        </button>


        <button class="pokemon-navigation previous" id="previousPokemon">
            ←
        </button>


        <div class="pokemon-details">
            <div class="details-image">
                <img id="detailImage" src="${pokedata.sprites.other["official-artwork"].front_default || pokedata.sprites.other.dream_world.front_default}" alt="">
            </div>

            <div class="details-content">
                <span id="detailNumber">#${pokedata.id}</span>
                <h2 id="detailName">${pokedata.name}</h2>

                <div id="detailTypes">
                    <!-- Typen -->
                </div>


                <div class="basic-info">
                    <div>
                        <p>Height</p>
                        <p id="detailHeight">${(pokedata.height)/10}m</p>
                    </div>

                    <div>
                        <p>Gewicht</p>
                        <p id="detailWeight">${(pokedata.weight)/10}kg</p>
                    </div>

                </div>


                <!-- TABS -->

                <div class="detail-tabs">

                    <button class="active">
                        Übersicht
                    </button>

                    <button>
                        Statuswerte
                    </button>

                    <button>
                        Entwicklungen
                    </button>

                </div>


                <!-- BESCHREIBUNG -->

                <section class="detail-section">

                    <h3>Beschreibung</h3>

                    <p id="detailDescription">
                        ...
                    </p>

                </section>


                <!-- FÄHIGKEITEN -->

                <section class="detail-section">

                    <h3>Fähigkeiten</h3>

                    <ul id="detailAbilities">
                        <!-- JS -->
                    </ul>

                </section>


                <!-- STATUSWERTE -->

                <section class="detail-section">

                    <h3>Statuswerte</h3>

                    <div id="detailStats" class="stats">
                        <!-- JS -->
                    </div>

                </section>


                <!-- ENTWICKLUNGEN -->

                <section class="detail-section">

                    <h3>Entwicklungen</h3>

                    <div id="evolutionChain" class="evolution-chain">
                        <!-- JS -->
                    </div>

                </section>

            </div>

        </div>


        <button class="pokemon-navigation next" id="nextPokemon">
            →
        </button>
    `;
}