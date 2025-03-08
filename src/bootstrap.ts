import { Reflector } from '@nestjs/core';
import { config } from './config/config.module';
import {
  ClassSerializerInterceptor,
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const bootstrap = async (app: INestApplication) => {
  app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nestjs Google Drive Upload App')
    .setDescription('a nestjs google drive upload app')
    .setVersion(process.env.npm_package_version ?? 'unknown')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/', app, documentFactory);

  await app.listen(config.PORT);

  const logger = new Logger('bootstrap');
  logger.verbose(
    `Application is running on http://localhost:${config.PORT} with environment ${config.NODE_ENV}`,
  );
  logger.verbose('Happy using!');
};
