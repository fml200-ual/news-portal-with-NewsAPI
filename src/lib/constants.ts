export const DEFAULT_NEWS_IMAGE = 'https://placehold.co/600x400.png?text=No+Image';

export const getPlaceholderImage = (category: string) => 
  `https://placehold.co/600x400.png?text=${encodeURIComponent(category || 'News')}`;

export const NEWS_CATEGORIES = {
  all: 'Todas',
  business: 'Negocios',
  entertainment: 'Entretenimiento',
  general: 'General',
  health: 'Salud',
  science: 'Ciencia',
  sports: 'Deportes',
  technology: 'Tecnología'
} as const;
