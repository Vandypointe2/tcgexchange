let currentPage = 0;
const pageSize = 20;
let loading = false;
let allCardsLoaded = false;
let firstSearch = false;

// inventory modal injected from partial
let invModalReady = false;

// Enum values for dropdowns
const enums = {
    sets: [ // lol 
        "Base", "Jungle", "Wizards Black Star Promos", "Fossil", "Base Set 2", "Team Rocket", "Gym Heroes", "Gym Challenge",
        "Neo Genesis", "Neo Discovery", "Southern Islands", "Neo Revelation", "Neo Destiny", "Legendary Collection", "Expedition Base Set",
        "Aquapolis", "Skyridge", "Ruby & Sapphire", "Sandstorm", "Dragon", "Nintendo Black Star Promos", "Team Magma vs Team Aqua",
        "Hidden Legends", "FireRed & LeafGreen", "POP Series 1", "Team Rocket Returns", "Deoxys", "Emerald", "Unseen Forces", "POP Series 2",
        "Delta Species", "Legend Maker", "POP Series 3", "Holon Phantoms", "Crystal Guardians", "POP Series 4", "Dragon Frontiers", "POP Series 5",
        "Power Keepers", "Diamond & Pearl", "DP Black Star Promos", "Mysterious Treasures", "POP Series 6", "Secret Wonders", "Great Encounters",
        "POP Series 7", "Majestic Dawn", "Legends Awakened", "POP Series 8", "Stormfront", "Platinum", "POP Series 9", "Rising Rivals",
        "Supreme Victors", "Arceus", "Pokémon Rumble", "HeartGold & SoulSilver", "HGSS Black Star Promos", "HS—Unleashed", "HS—Undaunted",
        "HS—Triumphant", "Call of Legends", "BW Black Star Promos", "Black & White", "McDonald's Collection 2011", "Emerging Powers", "Noble Victories",
        "Next Destinies", "Dark Explorers", "McDonald's Collection 2012", "Dragons Exalted", "Dragon Vault", "Boundaries Crossed", "Plasma Storm",
        "Plasma Freeze", "Plasma Blast", "XY Black Star Promos", "Legendary Treasures", "Kalos Starter Set", "XY", "Flashfire", "Furious Fists",
        "Phantom Forces", "Primal Clash", "Double Crisis", "Roaring Skies", "Ancient Origins", "BREAKthrough", "BREAKpoint", "Generations",
        "Fates Collide", "Steam Siege", "McDonald's Collection 2016", "Evolutions", "Sun & Moon", "SM Black Star Promos", "Guardians Rising",
        "Burning Shadows", "Shining Legends", "Crimson Invasion", "Ultra Prism", "Forbidden Light", "Celestial Storm", "Dragon Majesty",
        "Lost Thunder", "Team Up", "Detective Pikachu", "Unbroken Bonds", "Unified Minds", "Hidden Fates", "Hidden Fates Shiny Vault",
        "McDonald's Collection 2019", "Cosmic Eclipse", "SWSH Black Star Promos", "Sword & Shield", "Rebel Clash", "Darkness Ablaze",
        "Champion's Path", "Vivid Voltage", "Shining Fates", "Shining Fates Shiny Vault", "Battle Styles", "Chilling Reign", "Evolving Skies",
        "Celebrations", "Celebrations: Classic Collection", "McDonald's Collection 2014", "McDonald's Collection 2015", "McDonald's Collection 2018",
        "McDonald's Collection 2017", "McDonald's Collection 2021", "Best of Game", "Fusion Strike", "Pokémon Futsal Collection", "EX Trainer Kit Latias",
        "EX Trainer Kit Latios", "EX Trainer Kit 2 Plusle", "EX Trainer Kit 2 Minun", "Brilliant Stars", "Brilliant Stars Trainer Gallery",
        "Astral Radiance", "Astral Radiance Trainer Gallery", "Pokémon GO", "Lost Origin", "Lost Origin Trainer Gallery", "Silver Tempest",
        "Silver Tempest Trainer Gallery", "McDonald's Collection 2022", "Crown Zenith", "Crown Zenith Galarian Gallery", "Scarlet & Violet",
        "Scarlet & Violet Black Star Promos", "Paldea Evolved", "Scarlet & Violet Energies", "Obsidian Flames", "151", "Paradox Rift", "Paldean Fates",
        "Temporal Forces", "Twilight Masquerade", "Shrouded Fable", "Stellar Crown", "Surging Sparks", "Prismatic Evolutions", "Journey Together"
    ],
    types: [
        "Colorless", "Darkness", "Dragon", "Fairy", "Fighting",
        "Fire", "Grass", "Lightning", "Metal", "Psychic", "Water"
    ],
    // subtypes: [
    //     "Basic", "Stage 1", "Stage 2", "EX", "V", "VMAX", "VSTAR", "Trainer", "Supporter", "Item"
    // ],
    supertypes: [
        "Pokémon", "Trainer", "Energy"
    ],
    rarities: [
        "ACE SPEC Rare", "Amazing Rare", "Classic Collection", "Common", "Double Rare", "Hyper Rare", "Illustration Rare",
        "LEGEND", "Promo", "Radiant Rare", "Rare", "Rare ACE", "Rare BREAK", "Rare Holo", "Rare Holo EX", "Rare Holo GX",
        "Rare Holo LV.X", "Rare Holo Star", "Rare Holo V", "Rare Holo VMAX", "Rare Holo VSTAR", "Rare Prime",
        "Rare Prism Star", "Rare Rainbow", "Rare Secret", "Rare Shining", "Rare Shiny", "Rare Shiny GX", "Rare Ultra",
        "Shiny Rare", "Shiny Ultra Rare", "Special Illustration Rare", "Trainer Gallery Rare Holo", "Ultra Rare", "Uncommon"
    ],
    regulationMarks: ["D", "E", "F", "G", "H", "I"],
    legalities: ["Standard", "Expanded", "Unlimited"]
};

/**
 * Initialize sliders with noUiSlider
 */

const hpSlider = document.getElementById('hp-slider');
const retreatSlider = document.getElementById('retreat-slider');
const attackSlider = document.getElementById('attack-slider');

const hpMinInput = document.getElementById('hpMin');
const hpMaxInput = document.getElementById('hpMax');
const retreatMinInput = document.getElementById('retreatMin');
const retreatMaxInput = document.getElementById('retreatMax');
const attackMinInput = document.getElementById('attackMin');
const attackMaxInput = document.getElementById('attackMax');

// HP Slider
noUiSlider.create(hpSlider, {
    start: [0, 340],
    connect: true,
    range: {
        min: 0,
        max: 340
    },
    step: 10,
    tooltips: [true, true]
});

// Update display values when slider changes
hpSlider.noUiSlider.on('update', function (values, handle) {
    hpMinInput.value = Math.round(values[0]);
    hpMaxInput.value = Math.round(values[1]);
});

// Update slider when input values change
hpMinInput.addEventListener('change', () => {
    hpSlider.noUiSlider.set([hpMinInput.value, null]);
});
hpMaxInput.addEventListener('change', () => {
    hpSlider.noUiSlider.set([null, hpMaxInput.value]);
});

// Retreat Cost Slider
noUiSlider.create(retreatSlider, {
    start: [0, 5],
    connect: true,
    range: {
        min: 0,
        max: 5
    },
    step: 1,
    tooltips: [true, true]
});

// Update display values when slider changes
retreatSlider.noUiSlider.on('update', function (values, handle) {
    retreatMinInput.value = Math.round(values[0]);
    retreatMaxInput.value = Math.round(values[1]);
});

// Update slider when input values change
retreatMinInput.addEventListener('change', () => {
    retreatSlider.noUiSlider.set([retreatMinInput.value, null]);
});
retreatMaxInput.addEventListener('change', () => {
    retreatSlider.noUiSlider.set([null, retreatMaxInput.value]);
});

// Attack Cost Slider
noUiSlider.create(attackSlider, {
    start: [0, 5],
    connect: true,
    range: {
        min: 0,
        max: 5
    },
    step: 1,
    tooltips: [true, true]
});

// Update display values when slider changes
attackSlider.noUiSlider.on('update', function (values, handle) {
    attackMinInput.value = Math.round(values[0]);
    attackMaxInput.value = Math.round(values[1]);
});

// Update slider when input values change
attackMinInput.addEventListener('change', () => {
    attackSlider.noUiSlider.set([attackMinInput.value, null]);
});
attackMaxInput.addEventListener('change', () => {
    attackSlider.noUiSlider.set([null, attackMaxInput.value]);
});

// Update display values when form inputs change on reset
const form = document.getElementById('search-form');

form.addEventListener('reset', () => {
    // Wait a moment to allow inputs to reset
    setTimeout(() => {
        hpSlider.noUiSlider.reset();
        retreatSlider.noUiSlider.reset();
        attackSlider.noUiSlider.reset();
    }, 0);
});

// Helper function to make search query
async function searchCards(page = 1, append = false) {
    const container = document.getElementById('card-results');

    // check if we are making a new search to clear results and reset the flag
    if (!append) {
        container.innerHTML = '';
        allCardsLoaded = false;
    }

    const filters = {
        name: form.name.value,
        sets: getSelectedValues(form.sets),
        types: getSelectedValues(form.types),
        supertypes: getSelectedValues(form.supertypes),
        hp: {
            gte: hpMinInput.value > 0 ? hpMinInput.value : undefined,
            lte: hpMaxInput.value < 340 ? hpMaxInput.value : undefined
        },
        retreatCost: {
            gte: retreatMinInput.value > 0 ? retreatMinInput.value : undefined,
            lte: retreatMaxInput.value < 5 ? retreatMaxInput.value : undefined
        },
        attackCost: {
            gte: attackMinInput.value > 0 ? attackMinInput.value : undefined,
            lte: attackMaxInput.value < 5 ? attackMaxInput.value : undefined
        },
        nationalPokedexNumber: form.nationalPokedexNumber.value ? parseInt(form.nationalPokedexNumber.value) : undefined,
        cardnumber: form.cardNumber.value ? parseInt(form.cardNumber.value) : undefined,
        level: form.level.value ? parseInt(form.level.value) : undefined,
        artist: form.artist.value ? `~${form.artist.value}` : undefined, // fuzzy search
        text: form.flavorText.value,
        rarities: getSelectedValues(form.rarities),
        regulationMarks: getSelectedValues(form.regulationMarks),
        weaknesses: getSelectedValues(form.weaknesses),
        resistances: getSelectedValues(form.resistances),
        legalities: getSelectedValues(form.legalities)
    };

    // no empty searches, no searching while loading, no searching after the cards have been loaded (infinite scroll)
    if (!hasAtLeastOneFilter(filters) || loading || allCardsLoaded) return;

    loading = true;

    try {
        const allowApiFallback = localStorage.getItem('allowApiFallback') === 'true';

        // Prefer local search (CardCache). Optionally fall back to external API only if local returns 0.
        let data;
        try {
            data = await apiRequest('/cards/search_local', 'POST', {
                filters: filters,
                page,
                pageSize,
                sort: form.sort.value || 'name'
            });
        } catch (errLocal) {
            if (!allowApiFallback) throw errLocal;
            data = await apiRequest('/cards/search', 'POST', {
                filters: filters,
                page,
                pageSize,
                sort: form.sort.value || 'name'
            });
        }

        // If local search returns nothing, optionally try external API as a fallback.
        if (allowApiFallback && (!data?.cards || data.cards.length === 0)) {
            data = await apiRequest('/cards/search', 'POST', {
                filters: filters,
                page,
                pageSize,
                sort: form.sort.value || 'name'
            });
        }

        if (!data.cards || data.cards.length === 0) {
            if (!append) {
                const allowApiFallback = localStorage.getItem('allowApiFallback') === 'true';
                container.innerHTML = allowApiFallback
                    ? '<p>No cards found.</p>'
                    : '<p>No cards found (local-only search). Turn on API Fallback to broaden results.</p>';
            }
            allCardsLoaded = true;
            return;
        }

        data.cards.forEach((card) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.innerHTML = `
        <a href="/card.html?id=${card.id}" class="card-link">
            <img src="${card.images.large}" alt="${card.name}" />
        </a>
        <h3>${card.name}</h3>
        <small>${(card.set && (card.set.ptcgoCode || card.set.name)) ? (card.set.ptcgoCode || card.set.name) : 'SET'}: ${card.number || ''}</small>
        <div style="display:flex; gap:.5rem; margin-top:.5rem;">
          <button data-action="add-collection" data-id="${card.id}">+ Collection</button>
          <button data-action="add-wishlist" data-id="${card.id}">+ Wishlist</button>
        </div>`;
            container.appendChild(cardEl);

            requestAnimationFrame(() => {
                cardEl.classList.add('loaded');
            });
        });

        if (data.cards.length < pageSize) {
            allCardsLoaded = true;
        }

        currentPage = page;
    } catch (err) {
        console.error('Search failed:', err);
        if (!append) container.innerHTML = '<p>Something went wrong.</p>';
    } finally {
        loading = false;
    }
}

// Search Event Listener
document.getElementById('search-form').addEventListener('submit', (e) => {
    firstSearch = true;
    e.preventDefault();
    currentPage = 1;
    searchCards(currentPage, false);
});

// Helper function to get selected values from multiselects
function getSelectedValues(selectElement) {
    return Array.from(selectElement.selectedOptions).map(opt => opt.value);
}

// Populate multiselect dropdowns with enum values
function populateMultiselect(id, options) {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = ''; // clear existing
    options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt;
        container.appendChild(option);
    });
}

// Populate sets dropdown from local DB (CardCache)
function populateSetsFromDb(sets) {
    const container = document.getElementById('sets');
    if (!container) return;
    container.innerHTML = '';
    sets.forEach((s) => {
        const option = document.createElement('option');
        option.value = s.id; // IMPORTANT: use setId as value
        option.textContent = s.name || s.id;
        container.appendChild(option);
    });
}

// Populate multiselect dropdowns on page load
document.addEventListener('DOMContentLoaded', async () => {
    // API fallback toggle (persisted)
    const apiToggle = document.getElementById('apiFallbackToggle');
    if (apiToggle) {
        apiToggle.checked = localStorage.getItem('allowApiFallback') === 'true';
        apiToggle.addEventListener('change', () => {
            localStorage.setItem('allowApiFallback', apiToggle.checked);
            showToast(apiToggle.checked ? 'API fallback enabled' : 'Local-only search enabled', 'info');
        });
    }

    // Sets: load from local DB to guarantee the filter matches CardCache
    try {
        const resp = await apiRequest('/cards/sets_local');
        if (resp?.sets && Array.isArray(resp.sets) && resp.sets.length > 0) {
            populateSetsFromDb(resp.sets);
        } else {
            // fallback to hardcoded list (values will be set names)
            populateMultiselect("sets", enums.sets);
        }
    } catch (e) {
        populateMultiselect("sets", enums.sets);
    }

    populateMultiselect("types", enums.types);
    populateMultiselect("supertypes", enums.supertypes);
    populateMultiselect("rarities", enums.rarities);
    populateMultiselect("regulationMarks", enums.regulationMarks);
    populateMultiselect("weaknesses", enums.types);
    populateMultiselect("resistances", enums.types);
    populateMultiselect("legalities", enums.legalities);

    // inject modal
    try {
        const res = await fetch('/partials/inventory-modal.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('beforeend', html);
        invModalReady = true;
        setupInventoryModal();
    } catch (e) {
        console.warn('Failed to load inventory modal', e);
    }

    // click handlers for add buttons
    document.getElementById('card-results')?.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        if (!invModalReady) return;
        const cardId = btn.dataset.id;
        const kind = btn.dataset.action === 'add-wishlist' ? 'wishlist' : 'collection';
        openInventoryModal({ kind, cardId });
    });
});

// Check if at least one filter is applied
function hasAtLeastOneFilter(filters) {
    if (!filters) return false;

    return Object.values(filters).some(value => {
        if (value === null || value === undefined) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return true;
        if (typeof value === 'object') return hasAtLeastOneFilter(value);
        return false;
    });
}

// Infinite Scroll
window.addEventListener('scroll', () => { // infinite scroll needs to be debounced
    if (loading || allCardsLoaded || !firstSearch) return;

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;

    if (scrolled >= scrollable - 200) {
        searchCards(currentPage + 1, true);
    }
});