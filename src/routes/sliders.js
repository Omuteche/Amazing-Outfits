const express = require('express');
const Slider = require('../models/Slider');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get active sliders
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const query = all === 'true' ? {} : { isActive: true };
    const sliders = await Slider.find(query).sort({ sortOrder: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get slider by ID
router.get('/:id', async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    res.json(slider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create slider (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const slider = new Slider(req.body);
    await slider.save();
    res.status(201).json(slider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update slider (admin only)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const slider = await Slider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    res.json(slider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete slider (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    res.json({ message: 'Slider deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
