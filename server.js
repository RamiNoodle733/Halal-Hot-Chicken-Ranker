const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const mongoose = require('mongoose');
require('dotenv').config();

const Restaurant = require('./models/Restaurant');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/halal-chicken-ranker';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity with external images/scripts
}));
app.use(compression()); // Compress responses
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection with caching for serverless
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // If we have a connection and it's ready (readyState 1 = connected), reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection is already being established, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering to fail fast if not connected
      serverSelectionTimeoutMS: 10000, // Wait up to 10s for DB to respond (helps with cold starts)
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    console.log('Connecting to MongoDB...');
    
    // Log masked URI for debugging (safety check)
    if (MONGODB_URI.includes('localhost') && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: Using localhost MongoDB URI in production!');
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

// Initial connection attempt (optional for local dev)
if (process.env.NODE_ENV !== 'production') {
  connectToDatabase().catch(err => console.error('❌ MongoDB connection error:', err));
}

// Routes

// Get all restaurants sorted by score (highest to lowest)
app.get('/api/restaurants', async (req, res) => {
  try {
    // Cache for 60 seconds on Vercel Edge Network, allow stale data while revalidating
    // This significantly reduces DB load and improves speed for users
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

    await connectToDatabase();
    // Use lean() for better performance (returns plain JS objects)
    const restaurants = await Restaurant.find().sort({ score: -1 }).lean();
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants', details: error.message });
  }
});

// Upvote a restaurant
app.post('/api/restaurants/:id/upvote', async (req, res) => {
  try {
    await connectToDatabase();
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $inc: { score: 1, upvotes: 1 } },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error upvoting:', error);
    res.status(500).json({ error: 'Failed to upvote', details: error.message });
  }
});

// Downvote a restaurant
app.post('/api/restaurants/:id/downvote', async (req, res) => {
  try {
    await connectToDatabase();
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $inc: { score: -1, downvotes: 1 } },
      { new: true }
    );
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error downvoting:', error);
    res.status(500).json({ error: 'Failed to downvote', details: error.message });
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
