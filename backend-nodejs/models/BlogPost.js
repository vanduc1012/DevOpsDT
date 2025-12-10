const mongoose = require('mongoose');
const slugify = require('slugify');

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  summary: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  category: { type: String, default: 'Tin tức' },
  author: { type: String, default: 'NV Quán' },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
  content: { type: [String], default: [] },
  publishedAt: { type: Date, default: Date.now },
  createdBy: { type: String },
}, { timestamps: true });

BlogPostSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (!this.publishedAt && this.status === 'published') {
    this.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);

