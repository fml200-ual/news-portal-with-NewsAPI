import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export const setupSwagger = (app) => {
  const options = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentación automática de la API')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
};