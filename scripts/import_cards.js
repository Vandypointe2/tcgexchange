/* eslint-disable no-console */

// Import Pokemon card metadata from the pokemon-tcg-data repo JSON into SQLite.
//
// Usage:
//   node scripts/import_cards.js
//
// Defaults:
//   DATA_DIR=./data/pokemon-tcg-data
//   CARDS_GLOB=$DATA_DIR/cards/en/*.json

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const { CardCache, sequelize } = require('../models');

const DATA_DIR = process.env.POKEMON_TCG_DATA_DIR || path.join(__dirname, '..', 'data', 'pokemon-tcg-data');
const CARDS_DIR = path.join(DATA_DIR, 'cards', 'en');

function safeJson(x) {
  try { return JSON.stringify(x); } catch (e) { return null; }
}

async function main() {
  if (!fs.existsSync(CARDS_DIR)) {
    console.error(`Cards directory not found: ${CARDS_DIR}`);
    console.error('Download and unzip PokemonTCG/pokemon-tcg-data into ./data/pokemon-tcg-data');
    process.exit(1);
  }

  await sequelize.authenticate();

  const files = fs.readdirSync(CARDS_DIR).filter((f) => f.endsWith('.json'));
  console.log(`Found ${files.length} card-set files in ${CARDS_DIR}`);

  let total = 0;
  let upserted = 0;

  for (const file of files) {
    const p = path.join(CARDS_DIR, file);
    const raw = fs.readFileSync(p, 'utf8');
    const cards = JSON.parse(raw);
    if (!Array.isArray(cards)) continue;

    for (const c of cards) {
      total += 1;
      if (!c || !c.id || !c.name) continue;

      const row = {
        id: c.id,
        name: c.name,
        setId: c.set?.id,
        setName: c.set?.name,
        number: c.number,
        rarity: c.rarity,
        supertype: c.supertype,
        subtypesJson: c.subtypes ? safeJson(c.subtypes) : null,
        typesJson: c.types ? safeJson(c.types) : null,
        imageSmall: c.images?.small,
        imageLarge: c.images?.large
      };

      // upsert by primary key
      await CardCache.upsert(row);
      upserted += 1;

      if (upserted % 2000 === 0) {
        console.log(`Upserted ${upserted}...`);
      }
    }
  }

  console.log(`Done. Parsed=${total}, upserted=${upserted}`);
  await sequelize.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
