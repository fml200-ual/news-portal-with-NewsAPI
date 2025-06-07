// filepath: api-docs/src/docs/paths/index.ts
import { Request, Response } from 'express';
import { schemas } from '../components/schemas';
import { responses } from '../components/responses';

export const paths = {
  '/api/news': {
    get: {
      summary: 'Obtener noticias',
      description: 'Devuelve una lista de noticias filtradas por categoría.',
      parameters: [
        {
          name: 'category',
          in: 'query',
          required: true,
          description: 'Categoría de noticias a obtener.',
          schema: {
            type: 'string',
            enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
          },
        },
      ],
      responses: {
        '200': {
          description: 'Lista de noticias obtenidas con éxito.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: schemas.NewsArticle,
              },
            },
          },
        },
        '400': responses.badRequest,
        '500': responses.internalServerError,
      },
    },
  },
  '/api/news/{id}': {
    get: {
      summary: 'Obtener noticia por ID',
      description: 'Devuelve una noticia específica basada en su ID.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID de la noticia a obtener.',
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Noticia obtenida con éxito.',
          content: {
            'application/json': {
              schema: schemas.NewsArticle,
            },
          },
        },
        '404': responses.notFound,
        '500': responses.internalServerError,
      },
    },
  },
};