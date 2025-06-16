'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import './swagger-custom.css';

// Cargar SwaggerUI dinámicamente para evitar problemas de SSR
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function DocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar la especificación desde el endpoint
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => {
        setSpec(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-700">Cargando documentación...</p>
          <p className="mt-2 text-sm text-gray-500">Preparando la documentación interactiva de la API</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header mejorado */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              📰 <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Studio News API</span>
            </h1>
            <p className="text-xl text-gray-600 mb-4">Documentación Interactiva Completa</p>
            <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>API v1.0.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>OpenAPI 3.0</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>20+ Endpoints</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Container con mejor styling */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">          {spec && (
            <SwaggerUI 
              spec={spec}
              deepLinking={true}
              displayOperationId={false}
              defaultModelsExpandDepth={1}
              defaultModelExpandDepth={1}
              displayRequestDuration={true}
              tryItOutEnabled={true}
              filter={true}
              layout="BaseLayout"
              plugins={[]}
              supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
            />
          )}
        </div>
      </div>
      
      {/* Footer informativo */}
      <div className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-sm text-gray-500">
            <p className="mb-2">
              🚀 <strong>Studio News API</strong> - Plataforma completa de agregación de noticias
            </p>
            <div className="flex justify-center space-x-8">
              <span>🗂️ Gestión de Fuentes</span>
              <span>📰 NewsAPI</span>
              <span>⭐ Favoritos</span>
              <span>🤖 IA Integrada</span>
              <span>🔒 Autenticación</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}