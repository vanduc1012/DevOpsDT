const express = require('express');
const slugify = require('slugify');
const jwt = require('jsonwebtoken');
const BlogPost = require('../models/BlogPost');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Helper to normalize content into array of paragraphs
const normalizeContent = (content) => {
  if (!content) return [];
  if (Array.isArray(content)) return content;
  if (typeof content === 'string') {
    return content
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
};

// Optional auth to allow admin filters without blocking public users
const optionalAuth = async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cafe_secret_key_2025_very_long_and_secure_key_for_jwt_token_generation');
    const user = await User.findById(decoded.userId);
    if (user) {
      req.user = {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      };
    }
  } catch (err) {
    // ignore
  }
  next();
};

// Public & admin: list blog posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const { status, limit = 20, q, all } = req.query;

    const filter = {};
    if (isAdmin && all === 'true') {
      if (status) filter.status = status;
    } else {
      filter.status = 'published';
    }

    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }

    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(Number(limit) || 20)
      .lean();

    res.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Public detail by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).lean();
    if (!post) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    if (post.status !== 'published') {
      // Only admin can see drafts
      if (!(req.user && req.user.role === 'ADMIN')) {
        return res.status(404).json({ message: 'Bài viết không tồn tại' });
      }
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create blog post (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, summary, coverImage, category, author, status, content } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Thiếu tiêu đề' });
    }

    const normalizedSlug = slug
      ? slugify(slug, { lower: true, strict: true })
      : slugify(title, { lower: true, strict: true });

    const post = await BlogPost.create({
      title,
      slug: normalizedSlug,
      summary,
      coverImage,
      category,
      author,
      status: status || 'published',
      content: normalizeContent(content),
      createdBy: req.user?.username || req.user?.id,
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update blog post (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, slug, summary, coverImage, category, author, status, content } = req.body;
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }

    if (title) post.title = title;
    if (slug !== undefined) {
      post.slug = slugify(slug || post.title, { lower: true, strict: true });
    } else if (title && !post.slug) {
      post.slug = slugify(title, { lower: true, strict: true });
    }
    if (summary !== undefined) post.summary = summary;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category !== undefined) post.category = category;
    if (author !== undefined) post.author = author;
    if (status) {
      post.status = status;
      if (status === 'published' && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }
    if (content !== undefined) {
      post.content = normalizeContent(content);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete blog post (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
    await post.deleteOne();
    res.json({ message: 'Đã xóa bài viết' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update status (admin)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Bài viết không tồn tại' });
    post.status = status || post.status;
    if (status === 'published' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    await post.save();
    res.json(post);
  } catch (error) {
    console.error('Error updating blog status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

