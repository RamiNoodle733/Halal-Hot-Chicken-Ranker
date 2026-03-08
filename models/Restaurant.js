const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  heatLevel: {
    type: Number,
    default: 5
  },
  priceTier: {
    type: Number,
    default: 2
  },
  flavorScore: {
    type: Number,
    default: 7
  },
  crunchScore: {
    type: Number,
    default: 7
  },
  valueScore: {
    type: Number,
    default: 7
  },
  vibeScore: {
    type: Number,
    default: 7
  },
  specialty: {
    type: String,
    default: ''
  },
  comments: [{
    text: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    createdAt: { type: Date, default: Date.now },
    replies: [{
      text: { type: String, required: true },
      author: { type: String, default: 'Anonymous' },
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster sorting by score
restaurantSchema.index({ score: -1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
