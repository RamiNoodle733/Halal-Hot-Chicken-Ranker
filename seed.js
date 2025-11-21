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
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Dave%27s_Hot_Chicken_logo.svg/1200px-Dave%27s_Hot_Chicken_logo.svg.png"
      },
      { 
        name: "Main Bird Hot Chicken", 
        score: 0,
        description: "Started as a food truck in 2020, serving fully halal, Nashville-style hot chicken in Houston.",
        website: "https://mainbirdhotchicken.com",
        imageUrl: "https://images.squarespace-cdn.com/content/v1/600f05793b625b202f5d638d/1612298866854-5X5X5X5X5X5X5X5X5X5X/Main+Bird+Logo+Black.png" 
      },
      { 
        name: "Urban Bird Hot Chicken", 
        score: 0,
        description: "Veteran Owned and Operated. Original Nashville style Hot Chicken using only All Natural Halal chicken.",
        website: "https://www.urbanbirdhotchicken.com",
        imageUrl: "https://images.getbento.com/accounts/c8f98325f9d401269e54974753763912/media/images/9634Urban_Bird_Logo_Final-01.png"
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
