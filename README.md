# Halal Hot Chicken Ranker 🔥🍗

Flavor-first, community-powered rankings for halal hot chicken. Vote spots up or down, drop comments (and replies), and see which joints actually deliver on crunch, value, and vibe. Heat still shows up, but taste and price drive the leaderboard.

## What’s inside

- **Brand-forward UI** that matches the Halal Hot Chicken Ranker logo and energy (no analyst dashboards).
- **Fan-first leaderboard** with flavor, crunch, value, and vibe scores plus real-time vote counts.
- **Voting that sticks** with local fallbacks when the API is offline.
- **Threaded comments**: reply directly to takes and keep the convo under each spot.
- **Spot requests** via `/api/request`, with graceful logging if email credentials are missing.

## Stack

- **Backend**: Node.js + Express + Mongoose (cached connections for serverless). Endpoints for votes, comments, replies, and spot requests.
- **Frontend**: Vanilla HTML/CSS/JS (no build step). Dynamic rendering + sessionStorage to prevent duplicate votes per session.

## Running locally

1. Install dependencies
   ```bash
   npm install
   ```
2. Provide MongoDB if you want persistent votes/comments
   ```bash
   export MONGODB_URI="mongodb://localhost:27017/halal-chicken-ranker"
   ```
3. Start the server
   ```bash
   npm start
   ```
   Visit `http://localhost:5000`.

> No automated tests or linters are configured. Voting/comments use Mongo when available; synthetic data enables offline interactions.

## Key API endpoints

- `GET /api/restaurants` — Sorted restaurants (score desc).
- `POST /api/restaurants/:id/vote` — Body `{ action, previousAction }` for up/down with swap support.
- `POST /api/restaurants/:id/comments` — Body `{ text, author? }` adds a top-level comment.
- `POST /api/restaurants/:id/comments/:commentId/replies` — Body `{ text, author? }` replies to an existing comment.
- `POST /api/request` — Body `{ name, location, link? }` (logs locally when email creds are absent).

## Deployment notes

- Static assets live in `public/` and are cached with compression + Helmet.
- Fallback seed data keeps the experience working when the API is unreachable.
- Session-based vote memory prevents duplicate clicks from reapplying the same action.
