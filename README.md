# Halal Hot Chicken Intelligence Lab 🍗📊

An over-the-top, portfolio-ready analytics experience that fuses the original hot chicken rankings with external web data, KPI dashboards, scenario modeling, and executive storytelling. The UI is fully offline-friendly with deterministic fallbacks when APIs or databases are unavailable.

## What’s inside

- **Data fabric**: Live API fetch for `/api/restaurants` plus external connectors (Plotly + Vega datasets) for macro, mobility, weather, and ops baselines.
- **Analyst dashboards**: KPI grid, pipeline health, narrative insights, and three interactive Chart.js visuals (leaderboard, forecast, radar profile).
- **Scenario modeling**: Adjustable lift slider that reprojects the forecast lines in real time.
- **Field intelligence**: Enriched cards with demand, ops, risk, sparkline forecasts, voting, and comments. Synthetic IDs allow offline interactions when no database is present.
- **Signal intake**: Inline + modal submission forms post to `/api/request` with graceful degradation when email is not configured.

## Stack

- **Backend**: Node.js + Express + Mongoose (API + email request handler). Cached connections for serverless friendliness.
- **Frontend**: Vanilla JS, Chart.js (CDN), HTML5, CSS with Space Grotesk/Manrope. No build step required.
- **External data**: Plotly datasets (population, airport traffic), Vega datasets (weather, cars) pulled directly from GitHub raw URLs.

## Running locally

1) Install dependencies
```bash
npm install
```

2) Provide MongoDB if you want persistent votes/comments
```bash
export MONGODB_URI="mongodb://localhost:27017/halal-chicken-ranker"
```

3) Start the server
```bash
npm start
```
Visit `http://localhost:5000`.

> No automated tests or linters are configured. Voting/comments work against Mongo; synthetic data is used when the API or DB is unreachable.

## Key API endpoints

- `GET /api/restaurants` — Sorted restaurants (score desc).
- `POST /api/restaurants/:id/vote` — Body `{ action, previousAction }` for up/down with swap support.
- `POST /api/restaurants/:id/comments` — Body `{ text, author? }`.
- `POST /api/request` — Body `{ name, location, link? }` (logs locally when email creds absent).

## Deployment notes

- Static assets live in `public/` and are cached with compression + Helmet.
- External datasets are fetched client-side; the experience gracefully falls back to bundled analyst-grade seed data when any connector is degraded.

## License

MIT
