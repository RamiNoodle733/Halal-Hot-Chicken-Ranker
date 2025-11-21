const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./models/Restaurant');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/halal-chicken-ranker';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes

// Get all restaurants sorted by score (highest to lowest)
app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ score: -1 });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// Upvote a restaurant
app.post('/api/restaurants/:id/upvote', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $inc: { score: 1 } },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// Downvote a restaurant
app.post('/api/restaurants/:id/downvote', async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $inc: { score: -1 } },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to downvote' });
  }
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🍗 Halal Hot Chicken Ranker server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
