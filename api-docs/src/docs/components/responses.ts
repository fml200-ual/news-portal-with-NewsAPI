// src/docs/components/responses.ts

export const responses = {
  NotFound: {
    description: 'Recurso no encontrado',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'El recurso solicitado no fue encontrado.'
            }
          }
        }
      }
    }
  },
  BadRequest: {
    description: 'Solicitud incorrecta',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'La solicitud no se pudo procesar debido a datos inválidos.'
            }
          }
        }
      }
    }
  },
  InternalServerError: {
    description: 'Error interno del servidor',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Ocurrió un error inesperado en el servidor.'
            }
          }
        }
      }
    }
  }
};