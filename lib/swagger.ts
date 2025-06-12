import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'News API Studio',
      version: '1.0.0',
      description: 'Documentación automática de la API de Studio News',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['src/app/api/**/*.ts'], // Rutas para generar docs a partir de JSDoc
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
