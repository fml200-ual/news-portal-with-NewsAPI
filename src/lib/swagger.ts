import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '📰 Studio News API',
      version: '1.0.0',
      termsOfService: 'https://studio-news.com/terms',
      contact: {
        name: '📧 Studio News API Support',
        email: 'support@studionews.com',
        url: 'https://github.com/studio-news/api'
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT'
      }    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: '🚀 Servidor de Desarrollo Local'
      },
      {
        url: 'https://studio-news.vercel.app',
        description: '🌐 Servidor de Producción'
      }
    ],
    tags: [
      {
        name: 'DataSources',
        description: '🗂️ **Fuentes de Datos** - Gestión completa de fuentes para web scraping (sitios web, APIs, URLs específicas)',
        externalDocs: {
          description: 'Guía de Web Scraping',
          url: 'https://docs.studio-news.com/scraping'
        }
      },
      {
        name: 'ScrapedItems', 
        description: '📄 **Artículos Extraídos** - CRUD completo de contenido extraído mediante scraping con enriquecimiento IA',
        externalDocs: {
          description: 'Gestión de Contenido',
          url: 'https://docs.studio-news.com/content'
        }
      },
      {
        name: 'News',
        description: '📰 **Noticias NewsAPI** - Integración con NewsAPI para noticias internacionales con sistema de caché optimizado',
        externalDocs: {
          description: 'NewsAPI Integration',
          url: 'https://newsapi.org/docs'
        }
      },
      {
        name: 'Favorites',
        description: '⭐ **Favoritos** - Sistema de gestión de artículos favoritos personalizado por usuario',
        externalDocs: {
          description: 'Guía de Favoritos',
          url: 'https://docs.studio-news.com/favorites'
        }
      },
      {
        name: 'User',
        description: '👤 **Usuario** - Gestión de perfiles y preferencias personalizadas de configuración',
        externalDocs: {
          description: 'Gestión de Usuario',
          url: 'https://docs.studio-news.com/user'
        }
      },
      {
        name: 'Authentication',
        description: '🔐 **Autenticación** - Registro de usuarios y gestión de sesiones seguras con NextAuth',
        externalDocs: {
          description: 'Guía de Autenticación',
          url: 'https://docs.studio-news.com/auth'
        }
      },
      {
        name: 'Health',
        description: '🏥 **Sistema** - Endpoints de monitoreo, salud y estado del sistema',
        externalDocs: {
          description: 'Monitoreo del Sistema',
          url: 'https://docs.studio-news.com/monitoring'
        }
      }
    ],    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: '🔒 **Autenticación por Sesión**: Cookie de sesión generada automáticamente por NextAuth.js al iniciar sesión. Los endpoints marcados con 🔒 requieren autenticación.'
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: '📄 Número de página para paginación',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 1
          }
        },
        PageSizeParam: {
          name: 'pageSize',
          in: 'query', 
          description: '📊 Cantidad de elementos por página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            example: 10
          }
        },
        SearchParam: {
          name: 'q',
          in: 'query',
          description: '🔍 Términos de búsqueda',
          required: false,
          schema: {
            type: 'string',
            minLength: 1,
            example: 'tecnología'
          }
        }
      },
      responses: {
        Unauthorized: {
          description: '🚫 No autorizado - Se requiere autenticación',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'No autorizado'
              }
            }
          }
        },
        NotFound: {
          description: '❌ Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Recurso no encontrado'
              }
            }
          }
        },
        ServerError: {
          description: '⚠️ Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                status: 'error',
                message: 'Error interno del servidor'
              }
            }
          }
        }
      },
      schemas: {
        DataSourceInput: {
          type: 'object',
          required: ['name', 'url', 'type'],
          properties: {
            name: { 
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: '📝 Nombre descriptivo de la fuente',
              example: 'El País - Tecnología'
            },
            type: {
              type: 'string',
              enum: ['web', 'api', 'url'],
              description: '🏷️ Tipo de fuente de datos',
              example: 'web'
            },
            url: { 
              type: 'string', 
              format: 'uri',
              description: '🌐 URL de la fuente a extraer',
              example: 'https://elpais.com/tecnologia'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: '📄 Descripción opcional de la fuente',
              example: 'Sección de tecnología del periódico El País'
            },
            requiresJavaScript: {
              type: 'boolean',
              default: false,
              description: '⚡ Si la fuente requiere JavaScript para cargar el contenido'
            },
            config: {
              type: 'object',
              description: '⚙️ Configuración específica de scraping',
              properties: {
                contentSelector: {
                  type: 'string',
                  description: '🎯 Selector CSS para el contenedor principal de artículos',
                  example: 'article.news-item'
                },
                titleSelector: {
                  type: 'string', 
                  description: '📰 Selector CSS para el título del artículo',
                  example: 'h2.title'
                },
                summarySelector: {
                  type: 'string',
                  description: '📝 Selector CSS para la descripción/resumen',
                  example: 'p.summary'
                },
                linkSelector: {
                  type: 'string',
                  description: '🔗 Selector CSS para el enlace del artículo', 
                  example: 'a.read-more'
                },
                imageSelector: {
                  type: 'string',
                  description: '🖼️ Selector CSS para la imagen del artículo',
                  example: 'img.featured-image'
                },
                useFullUrl: {
                  type: 'boolean',
                  default: true,
                  description: '🌐 Si se debe usar la URL completa para enlaces relativos'
                },
                maxItems: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  default: 20,
                  description: '📊 Cantidad máxima de artículos a extraer por sesión'
                }
              }
            }
          }
        },
        DataSource: {
          type: 'object',
          required: ['name', 'url'],
          properties: {
            _id: { 
              type: 'string', 
              description: 'ID único de la fuente',
              example: '64f5b2c1a123456789abcdef'
            },
            name: { 
              type: 'string', 
              description: 'Nombre de la fuente',
              example: 'El País'
            },
            type: {
              type: 'string',
              enum: ['web', 'api', 'url'],
              description: 'Tipo de fuente de datos'
            },
            url: { 
              type: 'string', 
              format: 'uri',
              description: 'URL de la fuente',
              example: 'https://elpais.com'
            },
            description: {
              type: 'string',
              description: 'Descripción de la fuente'
            },
            isActive: { 
              type: 'boolean', 
              description: 'Estado de la fuente',
              default: true
            },
            status: {
              type: 'string',
              enum: ['idle', 'scraping', 'completed', 'error'],
              description: 'Estado actual del scraping'
            },
            config: {
              type: 'object',
              properties: {
                selectors: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', example: 'h1, h2.title' },
                    description: { type: 'string', example: '.summary, .excerpt' },
                    content: { type: 'string', example: '.content, .body' },
                    image: { type: 'string', example: 'img.featured' },
                    link: { type: 'string', example: 'a[href]' },
                    container: { type: 'string', example: '.article-item' },
                    publishedAt: { type: 'string', example: '.date, time' }
                  }
                },
                maxItems: { type: 'number', description: 'Máximo número de artículos a extraer' }
              }
            },
            totalItems: {
              type: 'number',
              description: 'Total de artículos extraídos'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time', 
              description: 'Última actualización'
            },
            lastScrapedAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Última vez que se ejecutó scraping'
            }
          }
        },
        ScrapedItem: {
          type: 'object',
          required: ['title', 'url', 'sourceName'],
          properties: {
            _id: { 
              type: 'string',
              description: 'ID único del artículo',
              example: '64f5b2c1a123456789abcdef'
            },
            title: { 
              type: 'string', 
              description: 'Título del artículo',
              example: 'Nueva tecnología revoluciona el mercado'
            },
            description: { 
              type: 'string', 
              nullable: true,
              description: 'Descripción del artículo',
              example: 'Una innovadora solución tecnológica está cambiando...'
            },
            content: {
              type: 'string',
              nullable: true,
              description: 'Contenido completo del artículo'
            },
            url: { 
              type: 'string', 
              format: 'uri',
              description: 'URL del artículo original',
              example: 'https://elpais.com/articulo-ejemplo'
            },
            imageUrl: { 
              type: 'string', 
              format: 'uri',
              nullable: true,
              description: 'URL de la imagen del artículo',
              example: 'https://elpais.com/imagen.jpg'
            },
            sourceName: { 
              type: 'string', 
              description: 'Nombre de la fuente',
              example: 'El País'
            },
            dataSourceId: {
              type: 'string',
              description: 'ID de la fuente de datos que extrajo este artículo'
            },
            dataSourceName: {
              type: 'string',
              description: 'Nombre de la fuente de datos'
            },
            publishedAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Fecha de publicación del artículo'
            },
            category: { 
              type: 'string', 
              enum: ['technology', 'business', 'sports', 'science', 'health', 'entertainment', 'general'],
              description: 'Categoría del artículo',
              example: 'technology'
            },
            sentiment: { 
              type: 'string', 
              enum: ['positive', 'negative', 'neutral'],
              nullable: true,
              description: 'Análisis de sentimiento del artículo',
              example: 'positive'
            },
            summary: {
              type: 'string',
              nullable: true,
              description: 'Resumen generado automáticamente',
              example: 'Resumen del contenido del artículo...'
            },
            isEnriched: { 
              type: 'boolean',
              description: 'Si el artículo ha sido enriquecido con IA',
              default: false
            },
            scrapedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha cuando se extrajo el artículo'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time',
              description: 'Fecha de creación en la base de datos'
            },
            lastUpdatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Última actualización del artículo'
            }
          }
        },
        Article: {
          type: 'object',
          required: ['title', 'url'],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único del artículo',
              example: '64f5b2c1a123456789abcdef'
            },
            title: {
              type: 'string',
              description: 'Título del artículo',
              example: 'Últimas noticias sobre tecnología'
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Descripción del artículo',
              example: 'Una descripción breve del contenido...'
            },
            content: {
              type: 'string',
              nullable: true,
              description: 'Contenido completo del artículo'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'URL del artículo original',
              example: 'https://elpais.com/ejemplo'
            },
            imageUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
              description: 'URL de la imagen del artículo'
            },
            publishedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de publicación del artículo'
            },
            source: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Nombre de la fuente'
                },
                id: {
                  type: 'string',
                  nullable: true,
                  description: 'ID de la fuente'
                },
                url: {
                  type: 'string',
                  format: 'uri',
                  nullable: true,
                  description: 'URL de la fuente'
                }
              }
            },
            category: {
              type: 'string',
              enum: ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'],
              description: 'Categoría del artículo',
              example: 'technology'
            },
            language: {
              type: 'string',
              description: 'Idioma del artículo',
              example: 'es'
            },
            isFavorite: {
              type: 'boolean',
              description: 'Si el artículo está marcado como favorito',
              default: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación en la base de datos'
            }
          }
        },
        UserPreferences: {
          type: 'object',
          properties: {
            excludedSources: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de fuentes excluidas'
            },
            displayName: {
              type: 'string',
              description: 'Nombre a mostrar del usuario'
            },
            bio: {
              type: 'string',
              description: 'Biografía del usuario'
            },
            emailNotifications: {
              type: 'boolean',
              description: 'Si el usuario desea recibir notificaciones por email',
              default: true
            },
            theme: {
              type: 'string',
              enum: ['light', 'dark', 'system'],
              description: 'Tema preferido del usuario',
              default: 'system'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { 
              type: 'string', 
              description: 'Mensaje de error',
              example: 'Error interno del servidor'
            },
            message: {
              type: 'string',
              description: 'Mensaje descriptivo del error'
            },
            details: { 
              type: 'string', 
              description: 'Detalles adicionales del error (solo en desarrollo)',
              example: 'Connection timeout to database'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operación completada exitosamente'
            }
          }
        }
      }
    }
  },
  apis: ['./src/app/api/**/*.ts'] // Rutas donde están tus endpoints
};

export const swaggerSpec = swaggerJSDoc(options);