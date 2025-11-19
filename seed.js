const mongoose = require('mongoose');
require('dotenv').config();
const Restaurant = require('./models/Restaurant');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/halal-chicken-ranker';

const seedRestaurants = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    console.log('🗑️  Cleared existing restaurants');

    // Insert initial restaurants
    const restaurants = await Restaurant.insertMany([
      { name: "Dave's", score: 0 },
      { name: "Main Bird", score: 0 },
      { name: "Urban Bird", score: 0 }
    ]);

    console.log('🌱 Seeded restaurants:');
    restaurants.forEach(r => console.log(`   - ${r.name} (ID: ${r._id})`));

    await mongoose.connection.close();
    console.log('✅ Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedRestaurants();
