const express = require('express');
const Review = require('../models/Review');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all reviews (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'fullName')
      .populate('product', 'name')
      .populate('order')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'fullName')
      .populate('product', 'name')
      .populate('order');
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { order, product, rating, comment, isExitReview } = req.body;

    // Check if user already reviewed this product in this order
    const existingReview = await Review.findOne({ user: req.user._id, order, product });
    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists for this order and product' });
    }

    const review = new Review({
      user: req.user._id,
      order,
      product,
      rating,
      comment,
      isExitReview
    });
    await review.save();
    await review.populate('user', 'fullName');
    await review.populate('product', 'name');
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update review
router.patch('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = ['rating', 'comment', 'isExitReview'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });
    await review.save();
    await review.populate('user', 'fullName');
    await review.populate('product', 'name');
    res.json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
