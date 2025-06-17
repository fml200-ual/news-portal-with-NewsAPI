
import { NextResponse, type NextRequest } from 'next/server';
import { DataSource } from '@/lib/models/DataSource';
import { z } from 'zod';

const dataSourceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  type: z.enum(['web', 'api', 'url'], { errorMap: () => ({ message: "El tipo debe ser 'web', 'api' o 'url'" }) }),
  url: z.string().min(1, "La URL es requerida").url("Debe ser una URL válida"),
  requiresJavaScript: z.boolean().optional().default(false),
  config: z.object({
    contentSelector: z.string().optional(),
    titleSelector: z.string().optional(),
    summarySelector: z.string().optional(),
    linkSelector: z.string().optional(),
    imageSelector: z.string().optional(),
    useFullUrl: z.boolean().optional(),
    maxItems: z.number().optional(),
    selectors: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      image: z.string().optional(),
      publishedAt: z.string().optional(),
      link: z.string().optional(),
      container: z.string().optional()
    }).optional()
  }).optional()
});
/**
 * @swagger
 * /api/datasources:
 *   get:
 *     summary: 📋 Obtener todas las fuentes de datos
 *     description: |
 *       Recupera la lista completa de fuentes de datos configuradas para web scraping.
 *       
 *       **💡 Casos de uso:**
 *       - Listar todas las fuentes disponibles
 *       - Obtener información de configuración de scraping
 *       - Revisar el estado de las fuentes
 *       
 *       **📊 Datos incluidos:**
 *       - Información básica de la fuente (nombre, URL, tipo)
 *       - Configuración de selectores CSS
 *       - Estado y estadísticas de scraping
 *       - Fechas de creación y última actualización
 *     tags: [DataSources]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - in: query
 *         name: type
 *         description: 🏷️ Filtrar por tipo de fuente
 *         schema:
 *           type: string
 *           enum: [web, api, url]
 *           example: web
 *       - in: query
 *         name: status
 *         description: 📊 Filtrar por estado de la fuente
 *         schema:
 *           type: string
 *           enum: [active, inactive, error]
 *           example: active
 *     responses:
 *       200:
 *         description: ✅ Lista de fuentes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DataSource'
 *             examples:
 *               fuentes_ejemplo:
 *                 summary: Ejemplo de fuentes configuradas
 *                 value:
 *                   - _id: "64f5b2c1a123456789abcdef"
 *                     name: "El País - Tecnología"
 *                     type: "web"
 *                     url: "https://elpais.com/tecnologia"
 *                     status: "active"
 *                     totalItems: 150
 *                     createdAt: "2025-06-13T10:00:00Z"
 *                   - _id: "64f5b2c1a123456789abcde0"
 *                     name: "TechCrunch API"
 *                     type: "api"
 *                     url: "https://api.techcrunch.com/feed"
 *                     status: "active"
 *                     totalItems: 89
 *                     createdAt: "2025-06-12T15:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET() {
  try {
    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();
    const dataSources = await DataSource.find({}).sort({ createdAt: -1 });
    return NextResponse.json(dataSources);
  } catch (error) {
    console.error("Error al obtener fuentes de datos:", error);
    return NextResponse.json({ message: "Error al obtener fuentes de datos" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/datasources:
 *   post:
 *     summary: 🆕 Crear nueva fuente de datos
 *     description: |
 *       Crea una nueva fuente de datos para web scraping con configuración personalizada.
 *       
 *       **💡 Casos de uso:**
 *       - Agregar un nuevo sitio web para extraer noticias
 *       - Configurar selectores CSS específicos para el contenido
 *       - Establecer parámetros de scraping personalizados
 *       
 *       **⚙️ Configuración avanzada:**
 *       - **Selectores CSS**: Define cómo extraer títulos, contenido, imágenes, etc.
 *       - **JavaScript**: Habilita renderizado para sitios dinámicos
 *       - **Límites**: Controla la cantidad máxima de artículos por scraping
 *       
 *       **🔧 Tipos de fuente:**
 *       - `web`: Sitio web completo con navegación
 *       - `api`: Endpoint de API REST o RSS
 *       - `url`: URL específica para scraping directo
 *     tags: [DataSources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DataSourceInput'
 *           examples:
 *             sitio_web:
 *               summary: Configuración para sitio web de noticias
 *               value:
 *                 name: "El País - Tecnología"
 *                 type: "web"
 *                 url: "https://elpais.com/tecnologia"
 *                 description: "Sección de tecnología de El País"
 *                 requiresJavaScript: false
 *                 config:
 *                   contentSelector: "article.c_a"
 *                   titleSelector: "h2.c_t"
 *                   summarySelector: "p.c_d"
 *                   linkSelector: "a"
 *                   imageSelector: "img.c_m_i"
 *                   maxItems: 20
 *             api_rss:
 *               summary: Configuración para feed RSS/API
 *               value:
 *                 name: "TechCrunch RSS"
 *                 type: "api"
 *                 url: "https://techcrunch.com/feed/"
 *                 description: "Feed RSS de TechCrunch"
 *                 config:
 *                   maxItems: 50
 *     responses:
 *       201:
 *         description: ✅ Fuente de datos creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Fuente de datos creada exitosamente"
 *                 dataSource:
 *                   $ref: '#/components/schemas/DataSource'
 *       400:
 *         description: ❌ Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               url_invalida:
 *                 summary: URL inválida
 *                 value:
 *                   message: "La URL debe ser válida"
 *                   details: "Debe ser una URL válida"
 *               nombre_requerido:
 *                 summary: Nombre requerido
 *                 value:
 *                   message: "El nombre es requerido"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {
    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();
    
    const body = await request.json();
    const validation = dataSourceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Datos de entrada inválidos", 
        errors: validation.error.format() 
      }, { status: 400 });
    }
    
    const validatedData = validation.data;    // Verificar si ya existe una fuente con la misma URL
    const existingSource = await DataSource.findOne({ url: validatedData.url });
    if (existingSource) {
      return NextResponse.json({ 
        message: "Ya existe una fuente de datos con esta URL" 
      }, { status: 409 });
    }

    const newDataSource = new DataSource({
      name: validatedData.name,
      type: validatedData.type,
      url: validatedData.url,
      requiresJavaScript: validatedData.requiresJavaScript || false,
      config: validatedData.config,
      status: 'idle',
      createdAt: new Date().toISOString()
    });

    await newDataSource.save();

    return NextResponse.json({
      message: "Fuente de datos creada exitosamente",
      dataSource: newDataSource
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear fuente de datos:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    }
    return NextResponse.json({ 
      message: "Error al crear fuente de datos",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
