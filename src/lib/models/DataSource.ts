import mongoose, { Document, Schema } from 'mongoose';

export interface IDataSource extends Document {
  name: string;
  type: 'web' | 'api' | 'url';
  url: string; // URL para scraping
  status: 'idle' | 'scraping' | 'success' | 'error';
  createdAt: string;
  lastScrapedAt?: string;
  totalItems?: number;
  requiresJavaScript?: boolean;
  config?: {
    contentSelector?: string;
    titleSelector?: string;
    summarySelector?: string;
    linkSelector?: string;
    imageSelector?: string;
    useFullUrl?: boolean;
    maxItems?: number;
    selectors?: {
      title?: string;
      description?: string;
      content?: string;
      image?: string;
      publishedAt?: string;
      link?: string;
      container?: string;
    };
  };
  errorMessage?: string;
}

const dataSourceSchema = new Schema<IDataSource>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },  type: {
    type: String,
    enum: ['web', 'api', 'url'],
    required: true,
    default: 'web'
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
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
  status: {
    type: String,
    enum: ['idle', 'scraping', 'success', 'error'],
    default: 'idle'
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  lastScrapedAt: {
    type: String
  },
  totalItems: {
    type: Number,
    default: 0  },
  requiresJavaScript: {
    type: Boolean,
    default: false
  },
  config: {
    contentSelector: String,
    titleSelector: String,
    summarySelector: String,
    linkSelector: String,
    imageSelector: String,
    useFullUrl: Boolean,
    maxItems: Number,
    selectors: {
      title: String,
      description: String,
      content: String,
      image: String,
      publishedAt: String,
      link: String,
      container: String
    }
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: false // Usamos nuestros propios campos de fecha
});

// Índices para mejorar rendimiento
dataSourceSchema.index({ status: 1 });
dataSourceSchema.index({ createdAt: -1 });
dataSourceSchema.index({ lastScrapedAt: -1 });

export const DataSource = mongoose.models.DataSource || mongoose.model<IDataSource>('DataSource', dataSourceSchema);
