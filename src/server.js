const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://amazingoutfits.shop',
    'https://www.amazingoutfits.shop',
    'https://amazing-outfits-frontend.vercel.app'
  ],
  credentials: true
}));

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.path.includes('paystack')) {
    console.log('Paystack request:', req.path, req.query.reference || req.body);
  }
  next();
});

app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/amazingoutfits';
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const brandRoutes = require('./routes/brands');
const orderRoutes = require('./routes/orders');
const wishlistRoutes = require('./routes/wishlist');
const addressRoutes = require('./routes/addresses');
const blogRoutes = require('./routes/blog');
const sliderRoutes = require('./routes/sliders');
const uploadRoutes = require('./routes/upload');
const paystackRoutes = require('./routes/paystack');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
