# React Rewrite POC (Option A)

Branch: `react-rewrite-poc`

This is a separate React frontend built with **Vite + React + Tailwind**.
It is intentionally isolated from `feature/trading-demo`.

## Run (dev)

Terminal 1 (backend):
```bash
cd /home/Github/tcgexchange_revamp   # or your repo path
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
- React UI: http://localhost:5173/app/trades
- Existing HTML UI still works: http://localhost:3000/

## Notes
- Vite proxies /auth, /cards, /trades, etc. to the Express API on :3000.
- The POC includes: login/register + trade recommendations/matches/propose.
- Trade detail currently jumps to the existing server-rendered page.
