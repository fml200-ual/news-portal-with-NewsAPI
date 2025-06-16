// filepath: src/models/Article.ts
import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  url: { type: String, required: true, unique: true },
  imageUrl: { type: String, default: null },
  publishedAt: { type: Date, required: true, index: true },
  source: { type: String, enum: ['newsapi', 'scraping'], default: 'scraping' }, // Fuente del artículo
  sourceName: { type: String, required: true }, // Nombre del medio (CNN, BBC, etc.)
  sourceId: { type: String }, // ID del medio en NewsAPI
  sourceUrl: { type: String }, // URL del medio
  category: { type: String, required: true, index: true },
  language: { type: String, default: 'es' },
  isFavorite: { type: Boolean, default: false },
  isEnriched: { type: Boolean, default: false }, // Si ha sido procesado por IA
  sentiment: {
    score: { type: Number },
    label: { type: String, enum: ['positive', 'negative', 'neutral'] }
  },
  summary: { type: String }, // Resumen generado por IA
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);