'use client';

import { useState } from 'react';
import { Globe, MapPin, Earth } from '@/components/ui/safe-icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RegionSelectorProps {
  selectedRegion: 'spanish' | 'international' | 'all';
  onRegionChange: (region: 'spanish' | 'international' | 'all') => void;
  className?: string;
}

const REGIONS = [
  {
    value: 'all' as const,
    label: 'Todas las fuentes',
    description: 'Noticias de todo el mundo',
    icon: Globe,
  },
  {
    value: 'spanish' as const,
    label: 'Medios españoles',
    description: 'El País, El Mundo, ABC, La Vanguardia...',
    icon: MapPin,
  },
  {
    value: 'international' as const,
    label: 'Medios internacionales',
    description: 'CNN, BBC, Reuters, NYT, WSJ...',
    icon: Earth,
  },
];

export function RegionSelector({ 
  selectedRegion, 
  onRegionChange, 
  className = "" 
}: RegionSelectorProps) {
  const selectedRegionData = REGIONS.find(r => r.value === selectedRegion);
  const SelectedIcon = selectedRegionData?.icon || Globe;

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <SelectedIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{selectedRegionData?.label}</span>
            <span className="sm:hidden">Región</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {REGIONS.map((region) => {
            const Icon = region.icon;
            return (
              <DropdownMenuItem
                key={region.value}
                onClick={() => onRegionChange(region.value)}
                className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                  selectedRegion === region.value ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{region.label}</span>
                  {selectedRegion === region.value && (
                    <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      Activo
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {region.description}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
