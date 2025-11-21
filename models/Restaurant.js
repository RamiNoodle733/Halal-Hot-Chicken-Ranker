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
