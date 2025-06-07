"use client";

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

const defaultTheme: Theme = 'system';

export function useTheme(): [Theme, (theme: Theme) => void] {
  // Almacenar el tema en estado local
  const [theme, setTheme] = useState<Theme>(() => {
    // Obtener el tema guardado del localStorage si existe
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    // Función para determinar si se debe usar el tema oscuro
    const shouldUseDark = () => {
      if (theme === 'dark') return true;
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    };

    // Función para actualizar la clase del documento
    const updateTheme = () => {
      if (shouldUseDark()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Guardar el tema en localStorage
    localStorage.setItem('theme', theme);

    // Actualizar el tema
    updateTheme();

    // Escuchar cambios en las preferencias del sistema si el tema es 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  return [theme, setTheme];
}
