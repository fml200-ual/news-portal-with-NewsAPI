"use client";


import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Globe, 
  Play, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Calendar
} from 'lucide-react';

interface DataSource {
  _id: string;
  name: string;
  type: string;
  url: string;
  status: 'idle' | 'scraping' | 'success' | 'error';
  totalItems?: number;
  lastScrapedAt?: string;
  createdAt: string;
  requiresJavaScript?: boolean;
  config?: any;
  errorMessage?: string;
}

interface NewDataSource {
  name: string;
  url: string;
  type: 'web';
  config: {
    contentSelector: string;
    titleSelector: string;
    summarySelector: string;
    linkSelector: string;
    imageSelector: string;
    useFullUrl: boolean;
    maxItems: number;
  };
}

const predefinedSources = [
  {
    name: "20 Minutos",
    url: "https://20minutos.es",
    config: {
      contentSelector: "article, .media-news, .story",
      titleSelector: "h2 a, h1, .media-news-title, .story-title",
      summarySelector: ".media-news-summary, .entradilla, .story-summary",
      linkSelector: "h2 a, .media-news-title a, .story-title a",
      imageSelector: "img",
      useFullUrl: true,
      maxItems: 20
    }
  },
  {
    name: "El Economista",
    url: "https://eleconomista.es",
    config: {
      contentSelector: "article, .articleContent, .story-box",
      titleSelector: ".articleHeadline, .articleHeadline a, h2 a, .story-title",
      summarySelector: ".description, .summary, .story-summary",
      linkSelector: ".articleHeadline a, h2 a, .story-title a",
      imageSelector: "img",
      useFullUrl: true,
      maxItems: 20
    }
  },
  {
    name: "El País",
    url: "https://elpais.com",
    config: {
      contentSelector: "article",
      titleSelector: "h1, h2, .c_t",
      summarySelector: ".c_d, .c_e",
      linkSelector: "a",
      imageSelector: "img",
      useFullUrl: true,
      maxItems: 15
    }
  },
  {
    name: "El Mundo",
    url: "https://elmundo.es",
    config: {
      contentSelector: "article",
      titleSelector: "h1, h2, .ue-c-cover-content__headline",
      summarySelector: ".ue-c-cover-content__standfirst, .ue-c-article__standfirst",
      linkSelector: "a",
      imageSelector: "img",
      useFullUrl: true,
      maxItems: 15
    }
  }
];

export default function DataSourcesPage() {
  const { toast } = useToast();
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scrapingStates, setScrapingStates] = useState<Record<string, boolean>>({});
  
  const [newSource, setNewSource] = useState<NewDataSource>({
    name: '',
    url: '',
    type: 'web',
    config: {
      contentSelector: 'article',
      titleSelector: 'h1, h2',
      summarySelector: '.description, .summary',
      linkSelector: 'a',
      imageSelector: 'img',
      useFullUrl: true,
      maxItems: 10
    }
  });

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/datasources');
      if (!response.ok) throw new Error('Error al cargar fuentes');
      const sources = await response.json();
      setDataSources(sources);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las fuentes de datos"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSources();
  }, []);

  const createDataSource = async () => {
    try {
      const response = await fetch('/api/datasources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSource)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear fuente');
      }

      toast({
        title: "Éxito",
        description: "Fuente de datos creada correctamente"
      });

      setIsDialogOpen(false);
      setNewSource({
        name: '',
        url: '',
        type: 'web',
        config: {
          contentSelector: 'article',
          titleSelector: 'h1, h2',
          summarySelector: '.description, .summary',
          linkSelector: 'a',
          imageSelector: 'img',
          useFullUrl: true,
          maxItems: 10
        }
      });
      
      fetchDataSources();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const deleteDataSource = async (id: string) => {
    try {
      const response = await fetch(`/api/datasources/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar fuente');

      toast({
        title: "Éxito",
        description: "Fuente eliminada correctamente"
      });
      
      fetchDataSources();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la fuente"
      });
    }
  };

  const runScraping = async (id: string) => {
    setScrapingStates(prev => ({ ...prev, [id]: true }));
    
    try {
      const response = await fetch(`/api/datasources/${id}/scrape`, {
        method: 'POST'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Error en scraping');
      }

      toast({
        title: "Scraping completado",
        description: `${result.itemsScraped} artículos nuevos extraídos`
      });
      
      fetchDataSources();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en scraping",
        description: error.message
      });
    } finally {
      setScrapingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  const usePredefinedSource = (source: typeof predefinedSources[0]) => {
    setNewSource({
      name: source.name,
      url: source.url,
      type: 'web',
      config: source.config
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'scraping': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'scraping': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
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
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary flex items-center">
              <Globe className="w-10 h-10 mr-3" />
              Fuentes de Datos
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Gestiona las fuentes de noticias y ejecuta scraping en tiempo real
            </p>          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nueva Fuente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Fuente de Datos</DialogTitle>
                <DialogDescription>
                  Configura una nueva fuente para extraer noticias mediante scraping
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la fuente</Label>
                    <Input
                      id="name"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      placeholder="Ej: El País Tecnología"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="url">URL del sitio web</Label>
                    <Input
                      id="url"
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Fuentes Predefinidas</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {predefinedSources.map((source) => (
                      <Button
                        key={source.name}
                        variant="outline"
                        size="sm"
                        onClick={() => usePredefinedSource(source)}
                        className="justify-start"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        {source.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titleSelector">Selector de títulos</Label>
                    <Input
                      id="titleSelector"
                      value={newSource.config.titleSelector}
                      onChange={(e) => setNewSource({
                        ...newSource,
                        config: { ...newSource.config, titleSelector: e.target.value }
                      })}
                      placeholder="h1, h2, .title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="summarySelector">Selector de resumen</Label>
                    <Input
                      id="summarySelector"
                      value={newSource.config.summarySelector}
                      onChange={(e) => setNewSource({
                        ...newSource,
                        config: { ...newSource.config, summarySelector: e.target.value }
                      })}
                      placeholder=".description, .summary"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxItems">Máximo de artículos</Label>
                  <Input
                    id="maxItems"
                    type="number"
                    value={newSource.config.maxItems}
                    onChange={(e) => setNewSource({
                      ...newSource,
                      config: { ...newSource.config, maxItems: parseInt(e.target.value) || 10 }
                    })}
                    min="1"
                    max="50"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createDataSource}>
                  Crear Fuente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      

      {/* Listado de fuentes existentes */}
      {dataSources.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay fuentes configuradas</h3>
          <p className="text-gray-500 mb-4">Crea tu primera fuente de datos para comenzar</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primera Fuente
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataSources.map((source) => (
            <Card key={source._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <Badge className={getStatusColor(source.status)}>
                      {source.status === 'idle' ? 'Inactivo' :
                       source.status === 'scraping' ? 'Scraping...' :
                       source.status === 'success' ? 'Éxito' : 'Error'}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="truncate">
                  {source.url}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Artículos extraídos:</span>
                    <span className="font-semibold">{source.totalItems || 0}</span>
                  </div>
                  
                  {source.lastScrapedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(source.lastScrapedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {source.status === 'error' && source.errorMessage && (
                    <Alert className="mt-2">
                      <AlertDescription className="text-xs">
                        {source.errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => runScraping(source._id)}
                      disabled={scrapingStates[source._id] || source.status === 'scraping'}
                      className="flex-1"
                    >
                      {scrapingStates[source._id] ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Ejecutar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDataSource(source._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';
