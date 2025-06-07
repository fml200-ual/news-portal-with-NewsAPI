// filepath: src/models/Article.ts
import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  url: { type: String, required: true, unique: true },
  imageUrl: { type: String, default: null },
  publishedAt: { type: Date, required: true, index: true },
  source: {
    name: { type: String, required: true },
    id: { type: String },
    url: { type: String }
  },
  category: { type: String, required: true, index: true },
  language: { type: String, default: 'es' },
  isFavorite: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);