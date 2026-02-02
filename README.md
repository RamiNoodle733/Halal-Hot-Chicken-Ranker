# Halal Hot Chicken Ranker 🍗

halalhotchickenranker.com

A full-stack web application for ranking halal hot chicken restaurants with community voting.

## Features

- **Community Voting**: Upvote or downvote your favorite halal hot chicken restaurants
- **Live Rankings**: Restaurants are automatically sorted from highest to lowest score
- **Responsive Design**: Works great on desktop and mobile devices
- **Real-time Updates**: See ranking changes immediately after voting

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Data Storage**: In-memory (simple array)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## API Endpoints

- `GET /api/restaurants` - Get all restaurants sorted by score
- `POST /api/restaurants/:id/upvote` - Upvote a restaurant
- `POST /api/restaurants/:id/downvote` - Downvote a restaurant

## Current Restaurants

- Dave's
- Main Bird
- Urban Bird

## Development

To run in development mode:
```bash
npm run dev
```

## License

MIT
