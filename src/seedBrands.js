require('dotenv').config();
const mongoose = require('mongoose');
const Brand = require('./models/Brand');

// Default to local MongoDB if not set
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amazingoutfits';

const brands = [
  { name: 'Nike' },
  { name: 'Adidas' },
  { name: 'Puma' },
  { name: 'Reebok' },
  { name: 'Levi\'s' },
  { name: 'Gucci' },
  { name: 'Zara' },
  { name: 'H&M' },
  { name: 'Uniqlo' },
  { name: 'Supreme' }
];

async function seedBrands() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing brands
    await Brand.deleteMany({});
    console.log('Cleared existing brands');

    // Insert new brands
    for (const brandData of brands) {
      const slug = brandData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const brand = new Brand({ ...brandData, slug });
      await brand.save();
      console.log(`Added brand: ${brand.name}`);
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding brands:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

seedBrands();
