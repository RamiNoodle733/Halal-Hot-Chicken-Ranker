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
      { 
        name: "Dave's Hot Chicken", 
        score: 0,
        description: "Street food sensation turned fast-casual hit. Specializing in Nashville-style hot chicken tenders & sliders.",
        website: "https://daveshotchicken.com",
        imageUrl: "/images/daves-hot-chicken.jpg"
      },
      { 
        name: "Main Bird Hot Chicken", 
        score: 0,
        description: "Started as a food truck in 2020, serving fully halal, Nashville-style hot chicken in Houston.",
        website: "https://mainbirdhotchicken.com",
        imageUrl: "/images/main-bird.jpg" 
      },
      { 
        name: "Urban Bird Hot Chicken", 
        score: 0,
        description: "Veteran Owned and Operated. Original Nashville style Hot Chicken using only All Natural Halal chicken.",
        website: "https://www.urbanbirdhotchicken.com",
        imageUrl: "/images/urban-bird.jpg"
      },
      {
        name: "Birdside HTX",
        score: 0,
        description: "On a mission to serve up 100% Halal fried chicken with a taste unlike anything you've experienced before.",
        website: "https://birdsidehtx.com",
        imageUrl: "/images/birdside-htx.jpg"
      }
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
