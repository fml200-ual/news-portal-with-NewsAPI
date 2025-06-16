"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Newspaper } from 'lucide-react';
import { SearchNews } from '@/components/news/search-news';
import { RegionSelector } from '@/components/news/RegionSelector';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import NewsList from '@/components/news/NewsList';

const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'scraping', label: 'Scraping' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'business', label: 'Negocios' },
  { value: 'sports', label: 'Deportes' },
  { value: 'science', label: 'Ciencia' },
  { value: 'health', label: 'Salud' },
  { value: 'entertainment', label: 'Entretenimiento' }
];

export default function NewsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<'spanish' | 'international' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleTabChange = (value: string) => {
    setSelectedCategory(value);
    setSearchQuery(''); // Limpiar búsqueda al cambiar categoría
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('all'); // Resetear categoría al buscar
  };

  const handleRegionChange = (region: 'spanish' | 'international' | 'all') => {
    setSelectedRegion(region);
    setSearchQuery(''); // Limpiar búsqueda al cambiar región
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.push('/profile')}
          >
            <UserCircle className="w-4 h-4" />
            Mi Perfil
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-2 flex items-center justify-center">
            <Newspaper className="w-10 h-10 mr-3 text-primary" />
            Últimas Noticias
          </h1>          <p className="text-lg text-muted-foreground mb-2">
            Explora noticias por categorías y busca temas específicos
          </p>
        </div>
      </header>      {/* Búsqueda y filtros */}
      <div className="mb-8 space-y-4">
        {/* Barra de búsqueda */}
        <SearchNews onSearch={handleSearch} />
        
        {/* Selector de región */}
        <div className="flex justify-center">
          <RegionSelector 
            selectedRegion={selectedRegion}
            onRegionChange={handleRegionChange}
          />
        </div>
      </div>

      <Separator className="my-8" />

      {/* Filtros por categoría */}
      {!searchQuery && (
        <div className="mb-8">
          <Tabs value={selectedCategory} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4 sm:grid-cols-4 md:grid-cols-8 h-auto">
              {CATEGORIES.map((cat) => (
                <TabsTrigger 
                  key={cat.value} 
                  value={cat.value} 
                  className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}      {/* Lista de noticias con scroll infinito y ordenamiento */}
      <NewsList 
        category={selectedCategory === 'all' ? '' : selectedCategory}
        query={searchQuery}
        region={selectedRegion}
        initialPageSize={20}
      />
    </div>
  );
}
