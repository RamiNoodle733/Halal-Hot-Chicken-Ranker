const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory database for restaurants
let restaurants = [
  { id: 1, name: "Dave's", score: 0 },
  { id: 2, name: "Main Bird", score: 0 },
  { id: 3, name: "Urban Bird", score: 0 }
];

// Routes

// Get all restaurants sorted by score (highest to lowest)
app.get('/api/restaurants', (req, res) => {
  const sortedRestaurants = [...restaurants].sort((a, b) => b.score - a.score);
  res.json(sortedRestaurants);
});

// Upvote a restaurant
app.post('/api/restaurants/:id/upvote', (req, res) => {
  const id = parseInt(req.params.id);
  const restaurant = restaurants.find(r => r.id === id);
  
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  
  restaurant.score++;
  res.json(restaurant);
});

// Downvote a restaurant
app.post('/api/restaurants/:id/downvote', (req, res) => {
  const id = parseInt(req.params.id);
  const restaurant = restaurants.find(r => r.id === id);
  
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' });
  }
  
  restaurant.score--;
  res.json(restaurant);
});

// Start server
app.listen(PORT, () => {
  console.log(`🍗 Halal Hot Chicken Ranker server running on http://localhost:${PORT}`);
});
