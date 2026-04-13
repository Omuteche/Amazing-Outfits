const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Reset all flags to false
    const result = await Product.updateMany(
      {},
      {
        $set: {
          isFeatured: false,
          isNewArrival: false,
          isOnSale: false
        }
      }
    );
    
    console.log(`Updated ${result.modifiedCount} products - all flags reset to false`);
    
    // Log sample (first 5)
    const samples = await Product.find().limit(5).select('name isFeatured isNewArrival isOnSale category brand');
    console.log('Sample products:', JSON.stringify(samples, null, 2));
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

