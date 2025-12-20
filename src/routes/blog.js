const express = require('express');
const slugify = require('slugify');
const BlogPost = require('../models/BlogPost');
const { adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get published posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = req.user?.role === 'admin' ? {} : { isPublished: true };
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .populate('author', 'fullName')
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      BlogPost.countDocuments(query)
    ]);

    res.json({
      posts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by slug
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug })
      .populate('author', 'fullName');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only allow viewing unpublished posts if admin
    if (!post.isPublished && req.user?.role !== 'admin') {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'fullName');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create post (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const post = new BlogPost({
      ...req.body,
      slug,
      author: req.user._id,
      publishedAt: req.body.isPublished ? new Date() : null
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update post (admin only)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title, { lower: true, strict: true });
    }

    // Set publishedAt if being published for first time
    if (req.body.isPublished) {
      const existing = await BlogPost.findById(req.params.id);
      if (existing && !existing.isPublished) {
        req.body.publishedAt = new Date();
      }
    }
    
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete post (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
