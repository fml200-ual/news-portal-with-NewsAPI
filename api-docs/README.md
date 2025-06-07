# Documentación Automática de la API

Este proyecto genera documentación automática para la API utilizando Swagger. A continuación se presentan las instrucciones para configurar y utilizar la documentación.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
api-docs
├── src
│   ├── config
│   │   └── swagger.ts         # Configuración de Swagger
│   ├── docs
│   │   ├── components
│   │   │   ├── schemas.ts     # Esquemas de datos
│   │   │   └── responses.ts    # Respuestas estándar
│   │   ├── paths
│   │   │   └── index.ts       # Definición de endpoints
│   │   └── tags.ts            # Organización de endpoints
│   └── index.ts               # Punto de entrada de la aplicación
├── templates
│   └── api-template.md        # Plantilla para la documentación
├── package.json               # Configuración de npm
├── tsconfig.json              # Configuración de TypeScript
└── README.md                  # Documentación del proyecto
```

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd api-docs
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

## Uso

Para iniciar el servidor y generar la documentación de la API, ejecuta el siguiente comando:

```bash
npm start
```

La documentación estará disponible en `http://localhost:3000/api-docs`.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.