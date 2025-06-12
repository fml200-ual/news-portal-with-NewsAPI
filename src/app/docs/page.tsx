'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function DocsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Documentación de la API</h1>
      <SwaggerUI url="/api/docs" />
    </div>
  );
}
