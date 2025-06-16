"use client";

import { useEffect } from 'react';

export function ErrorSuppressor() {
  useEffect(() => {
    // Sobrescribir console.error temporalmente para filtrar warnings específicos
    const originalError = console.error;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Filtrar warnings específicos de React StrictMode
      if (
        message.includes('UNSAFE_componentWillReceiveProps') ||
        message.includes('componentWillReceiveProps') ||
        message.includes('Please update the following components: G, i, sr')
      ) {
        return; // No mostrar estos warnings
      }
      
      // Mostrar otros errores normalmente
      originalError(...args);
    };
    
    // Restaurar console.error al desmontar
    return () => {
      console.error = originalError;
    };
  }, []);
  
  return null;
}
