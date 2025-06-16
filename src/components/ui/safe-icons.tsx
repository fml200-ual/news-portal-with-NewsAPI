"use client";

import React from 'react';
import * as LucideIcons from 'lucide-react';

// Wrapper para suprimir warnings de StrictMode en iconos de terceros
const createSafeIcon = (IconComponent: React.ComponentType<any>) => {
  return React.forwardRef<SVGSVGElement, React.ComponentProps<typeof IconComponent>>((props, ref) => {
    return <IconComponent {...props} ref={ref} />;
  });
};

// Exportar iconos seguros
export const BarChart3 = createSafeIcon(LucideIcons.BarChart3);
export const Globe = createSafeIcon(LucideIcons.Globe);
export const FileText = createSafeIcon(LucideIcons.FileText);
export const Clock = createSafeIcon(LucideIcons.Clock);
export const TrendingUp = createSafeIcon(LucideIcons.TrendingUp);
export const RefreshCw = createSafeIcon(LucideIcons.RefreshCw);
export const Search = createSafeIcon(LucideIcons.Search);
export const Filter = createSafeIcon(LucideIcons.Filter);
export const SortAsc = createSafeIcon(LucideIcons.SortAsc);
export const SortDesc = createSafeIcon(LucideIcons.SortDesc);
export const ChevronDown = createSafeIcon(LucideIcons.ChevronDown);
export const X = createSafeIcon(LucideIcons.X);
export const Menu = createSafeIcon(LucideIcons.Menu);
export const Home = createSafeIcon(LucideIcons.Home);
export const Settings = createSafeIcon(LucideIcons.Settings);
export const Newspaper = createSafeIcon(LucideIcons.Newspaper);
export const MapPin = createSafeIcon(LucideIcons.MapPin);
export const Earth = createSafeIcon(LucideIcons.Earth);
