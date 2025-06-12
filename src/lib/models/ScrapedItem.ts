import mongoose, { Document, Schema } from 'mongoose';

export interface IScrapedItem extends Document {
  title: string;
  description?: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: string;
  sourceName: string;
  dataSourceId: string;
  dataSourceName?: string;
  isEnriched: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral';
  summary?: string;
  originalUrl?: string;
  scrapedAt: string;
  createdAt: string;
  lastUpdatedAt: string;
}

const scrapedItemSchema = new Schema<IScrapedItem>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  content: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        if (!v) return false;
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Debe ser una URL válida'
    }
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Opcional
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Debe ser una URL válida'
    }
  },
  publishedAt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technology', 'business', 'sports', 'science', 'health', 'entertainment', 'general'],
    default: 'general'
  },
  sourceName: {
    type: String,
    required: true,
    trim: true
  },
  dataSourceId: {
    type: String,
    required: true
  },
  dataSourceName: {
    type: String,
    trim: true
  },
  isEnriched: {
    type: Boolean,
    default: false
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral']
  },
  summary: {
    type: String,
    trim: true
  },
  originalUrl: {
    type: String
  },
  scrapedAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  lastUpdatedAt: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: false // Usamos nuestros propios campos de fecha
});

// Índices para mejorar rendimiento
scrapedItemSchema.index({ dataSourceId: 1 });
scrapedItemSchema.index({ category: 1 });
scrapedItemSchema.index({ publishedAt: -1 });
scrapedItemSchema.index({ scrapedAt: -1 });
scrapedItemSchema.index({ url: 1 }, { unique: true }); // Evitar duplicados

// Middleware para actualizar lastUpdatedAt
scrapedItemSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastUpdatedAt = new Date().toISOString();
  }
  next();
});

export const ScrapedItem = mongoose.models.ScrapedItem || mongoose.model<IScrapedItem>('ScrapedItem', scrapedItemSchema);
