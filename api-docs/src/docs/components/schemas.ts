// src/docs/components/schemas.ts

export const UserSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Identificador único del usuario',
    },
    name: {
      type: 'string',
      description: 'Nombre del usuario',
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Correo electrónico del usuario',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de creación del usuario',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de última actualización del usuario',
    },
  },
  required: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
};

export const ArticleSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Identificador único del artículo',
    },
    title: {
      type: 'string',
      description: 'Título del artículo',
    },
    content: {
      type: 'string',
      description: 'Contenido del artículo',
    },
    authorId: {
      type: 'string',
      format: 'uuid',
      description: 'Identificador del autor del artículo',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de creación del artículo',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de última actualización del artículo',
    },
  },
  required: ['id', 'title', 'content', 'authorId', 'createdAt', 'updatedAt'],
};