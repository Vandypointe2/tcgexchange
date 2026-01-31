# TCGexchange

A Node/Express app backed by SQLite for managing a Pokémon TCG collection + wishlist, plus a simple **trading demo flow** (matchmaking, trade proposals, and a message portal per-trade).

## Setup

### Install

```bash
npm install
```

### Initialize the database (SQLite)

```bash
npx sequelize-cli db:migrate
```

### Run the server

```bash
npm run dev
# http://localhost:3000
```

## Trading Demo (2 users)

This repo includes a small demo seed to guarantee trade matches.

### Seed demo users + cards + inventories

```bash
npm run seed:demo
```

Demo accounts:
- `alice` / `password123`
- `bob` / `password123`

### Demo flow

1. Open <http://localhost:3000/register.html> (optional if you use seeded users).
2. Login as **alice** at <http://localhost:3000/login.html>.
3. Go to **Trades** (nav → Trades) or open <http://localhost:3000/trades.html>.
4. Select **bob**, click **Find Matches**, then select one or more suggested 1:1 swaps.
5. Click **Propose Selected Swaps**.
6. Open a new incognito/private window and login as **bob**.
7. Go to <http://localhost:3000/trades.html> → open the proposed trade.
8. Bob can **Accept/Decline** and both users can message each other in the trade detail page.

## Card dataset (optional)

The trading demo seed works without importing the full Pokémon dataset (it creates a tiny "Demo Set" in `CardCaches`).

If you want full card search/detail browsing, you can import the PokémonTCG/pokemon-tcg-data dataset:

```bash
# put pokemon-tcg-data at ./data/pokemon-tcg-data (see scripts/import_cards.js)
npm run import:cards
```

## With Docker

```bash
docker compose up --build
```

## Linting

```bash
npm run lint
```

### Auto-fix

```bash
npm run lint:fix
```

