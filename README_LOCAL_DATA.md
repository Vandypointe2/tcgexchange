# Local Pokemon Card Dataset (static)

This project can use the static card metadata from:
https://github.com/PokemonTCG/pokemon-tcg-data

This avoids reliance on the pokemontcg.io API for card details.

## Download (Option A: release zip)

1) Create the folder:

```bash
mkdir -p data/pokemon-tcg-data
```

2) Download a release zip from GitHub and unzip into that folder.

After unzipping, you should have a path like:

```
data/pokemon-tcg-data/cards/en/*.json
```

## Import into SQLite

Run migrations (creates CardCaches table):

```bash
npx sequelize-cli db:migrate
```

Import cards:

```bash
node scripts/import_cards.js
```

### Custom dataset path

```bash
POKEMON_TCG_DATA_DIR=/path/to/pokemon-tcg-data node scripts/import_cards.js
```

## What gets stored

For each card id, we store (minimum useful UI fields):
- id, name
- setId, setName, number, rarity
- supertype, subtypes (json), types (json)
- imageSmall, imageLarge (URLs)
