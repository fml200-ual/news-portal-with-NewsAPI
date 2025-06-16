'use client';

import { useState } from 'react';
import { Search, X } from '@/components/ui/safe-icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchNewsProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchNews({ 
  onSearch, 
  placeholder = "Buscar noticias...", 
  className = "" 
}: SearchNewsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button type="submit" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </form>
      
      {searchTerm && (
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">
            Mostrando resultados para: <span className="font-medium">"{searchTerm}"</span>
          </p>
        </div>
      )}
    </div>
  );
}
