"use client";

import { useState, useEffect } from 'react';
import { getStats } from '@/services/hybridNewsService';
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
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalScrapedArticles: number;
  totalSources: number;
  newsApiActive: boolean;
  recentArticles: number;
  enrichedArticles: number;
}

export default function DashboardPage() {  const [stats, setStats] = useState<DashboardStats>({
    totalScrapedArticles: 0,
    totalSources: 0,
    newsApiActive: false,
    recentArticles: 0,
    enrichedArticles: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Usar el servicio híbrido para obtener estadísticas
      const hybridStats = await getStats();
      
      // Obtener artículos recientes y enriquecidos del scraping
      const enrichedResponse = await fetch('/api/scraped-items?limit=100');
      const enrichedData = await enrichedResponse.json();
      const enrichedCount = enrichedData.articles?.filter((article: any) => article.isEnriched).length || 0;
      
      // Obtener artículos recientes (últimas 24 horas)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const recentArticles = enrichedData.articles?.filter((article: any) => 
        new Date(article.createdAt) > yesterday
      ).length || 0;

      setStats({
        totalScrapedArticles: hybridStats.totalScrapedArticles,
        totalSources: hybridStats.totalSources,
        newsApiActive: hybridStats.newsApiActive,
        recentArticles,
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
        <div className="flex justify-between items-center">
          <div>            <h1 className="text-4xl font-headline font-bold text-primary flex items-center">
              <BarChart3 className="w-10 h-10 mr-3" />
              Dashboard Híbrido
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Resumen del sistema con NewsAPI como fuente principal + scraping local
            </p>
          </div>
          
          <Button onClick={fetchStats} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </div>
      </header>      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NewsAPI Estado</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.newsApiActive ? 'Activo' : 'Inactivo'}
            </div>
            <p className="text-xs text-muted-foreground">
              Fuente principal de noticias internacionales
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artículos Scrapeados</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScrapedArticles}</div>
            <p className="text-xs text-muted-foreground">
              Artículos extraídos de sitios españoles
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuentes Scraping</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSources}</div>
            <p className="text-xs text-muted-foreground">
              Sitios web configurados para scraping local
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
              Artículos con análisis de IA
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
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Sistema funcionando correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                Operativo
              </Badge>
              <span className="text-sm text-muted-foreground">
                MongoDB conectado
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
