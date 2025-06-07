'use client';

import { useEffect, useState } from 'react';
import { getNewsByCategory } from '@/services/newsService';
import type { NewsArticle } from '@/types';

interface NewsListProps {
  category: string;
}

export default function NewsList({ category }: NewsListProps) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const articles = await getNewsByCategory(category);
        setNews(articles);
      } catch (err) {
        setError('Error al cargar las noticias');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [category]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {news.map((article) => (
        <div key={article.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          {article.imageUrl && (
            <div className="relative h-48 mb-4">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{article.sourceName}</span>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString('es')}
            </time>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h2>
          {article.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">{article.description}</p>
          )}
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline mt-2 inline-flex items-center gap-1"
          >
            Leer más
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      ))}
    </div>
  );
}