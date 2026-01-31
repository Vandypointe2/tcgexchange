# React Rewrite POC (Option A)

Branch: `react-rewrite-poc`

This is a separate React frontend built with **Vite + React + Tailwind**.
It is intentionally isolated from `feature/trading-demo`.

## Run (dev)

Terminal 1 (backend):
```bash
cd /home/vandypointe2/Documents/GitHub/tcgexchange   # or your repo path
git checkout react-rewrite-poc
npm install
npx sequelize-cli db:migrate
npm run dev
```

Terminal 2 (react client):
```bash
cd client
npm install
npm run dev
```

Open:
- React UI: http://localhost:5173/app/search
- Existing HTML UI still works: http://localhost:3000/

## Notes
- Vite proxies /auth, /cards, /collection, /wishlist, /trades to the Express API on :3000.
- Pages implemented in the React client:
  - Search (local): /cards/search_local + /cards/sets_local
  - Card detail: /cards/local/:id (+ Collectr link using number/printedTotal)
  - Collection CRUD: /collection
  - Wishlist CRUD: /wishlist
  - Trades: recommendations/matches/propose (expects /trades endpoints)
  - Trade detail: expects /trades/:id + related message/respond/hide endpoints
  - Profile: /auth/me + /auth/change-password
- Theme toggle (light/dark) is persisted in localStorage.
