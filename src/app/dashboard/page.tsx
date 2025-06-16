"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Globe, 
  FileText, 
  Clock,
  TrendingUp,
  RefreshCw
} from '@/components/ui/safe-icons';
import Link from 'next/link';

interface DashboardStats {
  totalScrapedArticles: number;
  totalNewsApiArticles: number;
  totalSources: number;
  newsApiActive: boolean;
  recentArticles: number;
  enrichedArticles: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalScrapedArticles: 0,
    totalNewsApiArticles: 0,
    totalSources: 0,
    newsApiActive: false,
    recentArticles: 0,
    enrichedArticles: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Obtener estadísticas de artículos scrapeados
      const scrapedResponse = await fetch('/api/scraped-items?limit=1000');
      const scrapedData = await scrapedResponse.json();
      const scrapedArticles = scrapedData.articles || [];
      
      // Obtener estadísticas de NewsAPI (artículos sin scraping)
      const newsResponse = await fetch('/api/news?region=all&category=all');
      const newsData = await newsResponse.json();
      const newsApiArticles = newsData.articles || [];
      
      // Obtener fuentes de datos
      const sourcesResponse = await fetch('/api/datasources');
      const sourcesData = await sourcesResponse.json();
      const dataSources = sourcesData.dataSources || [];
      
      // Calcular estadísticas
      const enrichedCount = scrapedArticles.filter((article: any) => article.isEnriched).length;
      
      // Artículos recientes (últimas 24 horas)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentScraped = scrapedArticles.filter((article: any) => 
        new Date(article.createdAt || article.scrapedAt) > yesterday
      ).length;
      const recentNews = newsApiArticles.filter((article: any) => 
        new Date(article.publishedAt || article.createdAt) > yesterday
      ).length;

      setStats({
        totalScrapedArticles: scrapedArticles.length,
        totalNewsApiArticles: newsApiArticles.length,
        totalSources: dataSources.length,
        newsApiActive: newsApiArticles.length > 0,
        recentArticles: recentScraped + recentNews,
        enrichedArticles: enrichedCount
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex justify-between items-center">          <div>
            <h1 className="text-4xl font-headline font-bold text-primary flex items-center">
              <BarChart3 className="w-10 h-10 mr-3" />
              Dashboard de Noticias
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Sistema híbrido: NewsAPI para fuentes españolas/internacionales + Scraping local
            </p>
          </div>
          
          <Button onClick={fetchStats} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </header>      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NewsAPI</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNewsApiArticles}</div>
            <p className="text-xs text-muted-foreground">
              Artículos de fuentes españolas e internacionales
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scraping</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScrapedArticles}</div>
            <p className="text-xs text-muted-foreground">
              Artículos extraídos localmente
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuentes</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              Sitios web configurados
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentArticles}</div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enriquecidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrichedArticles}</div>
            <p className="text-xs text-muted-foreground">
              Con análisis de IA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ver Artículos
            </CardTitle>
            <CardDescription>
              Explora todos los artículos extraídos y enriquecidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/data">
              <Button className="w-full">
                Ir a Artículos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Gestionar Fuentes
            </CardTitle>
            <CardDescription>
              Configurar y ejecutar scraping en sitios web
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/datasources">
              <Button className="w-full">
                Gestionar Fuentes
              </Button>
            </Link>
          </CardContent>
        </Card>        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Sistema funcionando con {stats.totalNewsApiArticles + stats.totalScrapedArticles} artículos totales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                {stats.newsApiActive ? 'NewsAPI Activo' : 'Solo Scraping'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                {stats.totalSources} fuentes
              </Badge>
              <span className="text-sm text-muted-foreground">
                configuradas
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
