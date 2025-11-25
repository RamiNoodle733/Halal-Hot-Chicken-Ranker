const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  comments: [{
    text: { type: String, required: true },
    author: { type: String, default: 'Anonymous' },
    createdAt: { type: Date, default: Date.now }
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
