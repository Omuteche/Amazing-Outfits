const express = require('express');
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'product',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'brand', select: 'name slug' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to wishlist
router.post('/', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' });
    }

    const wishlistItem = new Wishlist({
      user: req.user._id,
      product: productId
    });
    await wishlistItem.save();

    const populated = await wishlistItem.populate({
      path: 'product',
      populate: [
        { path: 'category', select: 'name slug' },
        { path: 'brand', select: 'name slug' }
      ]
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove from wishlist
router.delete('/:productId', auth, async (req, res) => {
  try {
    const result = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const exists = await Wishlist.findOne({
      user: req.user._id,
      product: req.params.productId
    });
    res.json({ inWishlist: !!exists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
