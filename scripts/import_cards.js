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

function loadSetMetaMap(dataDir) {
  // Returns map: setId -> { id, name, series, releaseDate, printedTotal }
  // Supports either sets/en.json or sets/en/*.json.
  const map = {};

  const setsRoot = path.join(dataDir, 'sets');
  const setsEnJson = path.join(setsRoot, 'en.json');
  const setsEnDir = path.join(setsRoot, 'en');

  try {
    if (fs.existsSync(setsEnJson)) {
      const raw = fs.readFileSync(setsEnJson, 'utf8');
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        arr.forEach((s) => {
          if (!s?.id) return;
          map[s.id] = {
            id: s.id,
            name: s.name,
            series: s.series,
            releaseDate: s.releaseDate,
            printedTotal: s.printedTotal
          };
        });
      }
      return map;
    }

    if (fs.existsSync(setsEnDir)) {
      const files = fs.readdirSync(setsEnDir).filter((f) => f.endsWith('.json'));
      files.forEach((f) => {
        const p = path.join(setsEnDir, f);
        const raw = fs.readFileSync(p, 'utf8');
        const s = JSON.parse(raw);
        if (!s?.id) return;
        map[s.id] = {
          id: s.id,
          name: s.name,
          series: s.series,
          releaseDate: s.releaseDate,
          printedTotal: s.printedTotal
        };
      });
    }
  } catch (e) {
    // ignore; we'll just have an empty map
  }

  return map;
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

  // eslint-disable-next-line global-require
  const setConverter = require('../src/util/setConverter');
  const setMetaMap = loadSetMetaMap(DATA_DIR);

  for (const file of files) {
    const p = path.join(CARDS_DIR, file);
    const raw = fs.readFileSync(p, 'utf8');
    const cards = JSON.parse(raw);
    if (!Array.isArray(cards)) continue;

    // The pokemon-tcg-data repo stores cards in per-set files.
    // Some dumps include full card.set {id,name}, others omit it.
    // Use filename as a fallback setId.
    const setIdFromFile = path.basename(file, '.json');
    const setMetaFromFile = setMetaMap[setIdFromFile] || null;
    const setNameFromFile = setMetaFromFile?.name || setConverter.getSetNameById(setIdFromFile) || null;

    for (const c of cards) {
      total += 1;
      if (!c || !c.id || !c.name) continue;

      const finalSetId = c.set?.id || c.setId || setIdFromFile || null;
      const meta = (finalSetId && setMetaMap[finalSetId]) ? setMetaMap[finalSetId] : setMetaFromFile;

      const row = {
        id: c.id,
        name: c.name,
        setId: finalSetId,
        setName: c.set?.name || c.setName || meta?.name || setNameFromFile || null,
        setSeries: c.set?.series || c.setSeries || meta?.series || null,
        setReleaseDate: c.set?.releaseDate || c.setReleaseDate || meta?.releaseDate || null,
        setPrintedTotal: (c.set?.printedTotal ?? c.setPrintedTotal ?? meta?.printedTotal) ?? null,
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
