import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Studio News API',
      version: '1.0.0',
      description: 'Documentación automática de la API de Studio News',
      contact: {
        name: 'Studio News Team',
        email: 'contact@studionews.com'
      }
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      schemas: {
        DataSource: {
          type: 'object',
          required: ['name', 'url'],
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            description: { type: 'string' },
            isActive: { type: 'boolean', default: true },
            config: {
              type: 'object',
              properties: {
                selectors: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    image: { type: 'string' },
                    link: { type: 'string' }
                  }
                }
              }
            },
            lastScrapedAt: { type: 'string', format: 'date-time' },
            totalItems: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ScrapedItem: {
          type: 'object',
          required: ['title', 'url', 'sourceName'],
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            content: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            imageUrl: { type: 'string', format: 'uri' },
            publishedAt: { type: 'string', format: 'date-time' },
            category: { type: 'string' },
            sourceName: { type: 'string' },
            dataSourceId: { type: 'string' },
            isEnriched: { type: 'boolean', default: false },
            sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
            summary: { type: 'string' },
            scrapedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            lastUpdatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/app/api/**/*.ts']
};

export const swaggerSpec = swaggerJSDoc(options);