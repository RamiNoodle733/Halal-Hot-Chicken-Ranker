const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
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

// Handle voting (upvote, downvote, or swap)
app.post('/api/restaurants/:id/vote', async (req, res) => {
  try {
    await connectToDatabase();
    const { id } = req.params;
    const { action, previousAction } = req.body; // action: 'upvote'|'downvote', previousAction: 'upvote'|'downvote'|null

    let update = {};

    if (!previousAction) {
      // New vote
      if (action === 'upvote') {
        update = { $inc: { score: 1, upvotes: 1 } };
      } else if (action === 'downvote') {
        update = { $inc: { score: -1, downvotes: 1 } };
      }
    } else if (previousAction !== action) {
      // Swap vote
      if (action === 'upvote') {
        // Was downvote, now upvote: +1 up, -1 down, score +2
        update = { $inc: { score: 2, upvotes: 1, downvotes: -1 } };
      } else {
        // Was upvote, now downvote: -1 up, +1 down, score -2
        update = { $inc: { score: -2, upvotes: -1, downvotes: 1 } };
      }
    } else {
      // Same vote - do nothing or return current state
      const restaurant = await Restaurant.findById(id);
      return res.json(restaurant);
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, update, { new: true });
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    res.json(restaurant);
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to vote', details: error.message });
  }
});

// Upvote a restaurant (Legacy support)
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

// Add a comment to a restaurant
app.post('/api/restaurants/:id/comments', async (req, res) => {
  try {
    await connectToDatabase();
    const { text, author } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          comments: { 
            text: text.trim(),
            author: author || 'Anonymous',
            createdAt: new Date()
          } 
        } 
      },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Return the newly added comment (last one in the array)
    const newComment = restaurant.comments[restaurant.comments.length - 1];
    res.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
});

// Submit a new restaurant request
app.post('/api/request', async (req, res) => {
  const { name, location, link } = req.body;

  if (!name || !location) {
    return res.status(400).json({ error: 'Name and location are required' });
  }

  // If email is not configured, just log it
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('📝 New Request Received (Email not configured):', { name, location, link });
    // Return success so the UI doesn't break, but log that email wasn't sent
    return res.json({ message: 'Request received (logged only)' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: `🍗 New Halal Chicken Spot Request: ${name}`,
      text: `
        New Restaurant Request:
        
        Name: ${name}
        Location: ${location}
        Link: ${link || 'N/A'}
        
        Sent from Halal Hot Chicken Ranker
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
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
