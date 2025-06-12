import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'News API Studio',
      version: '1.0.0',
      description: 'Documentación automática de la API de Studio News',
    },
    servers: [{ url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002' }],
  },
  apis: ['./src/app/api/**/*.ts', './src/lib/models/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;