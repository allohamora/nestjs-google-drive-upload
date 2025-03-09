import 'reflect-metadata';
import './mocks/config.module.mock';
import * as supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';
import jestOpenApi from 'jest-openapi';
import { OpenAPISpecObject } from 'openapi-validator';
import { Server as HttpServer } from 'node:http';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { RootModule } from 'src/root.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { UploadStrategy } from 'src/file/strategy/upload.strategy';
import { UploadStrategyMock } from './mocks/upload.strategy.mock';
import { bootstrap } from 'src/bootstrap';

/* eslint-disable no-var */
declare global {
  var app: INestApplication;
  var httpServer: HttpServer;
  var request: (httpServer?: HttpServer) => TestAgent<supertest.Test>;
}
/* eslint-enable no-var */
beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [RootModule] })
    .overrideProvider(UploadStrategy)
    .useClass(UploadStrategyMock)
    .compile();
  const app = moduleRef.createNestApplication();

  app.useLogger(false);

  await bootstrap(app);

  global.app = app;

  jestOpenApi(
    SwaggerModule.createDocument(
      global.app,
      new DocumentBuilder().build(),
    ) as OpenAPISpecObject,
  );

  global.httpServer = global.app.getHttpServer();
  global.request = (httpServer = global.httpServer) => supertest(httpServer);
});

afterEach(async () => {
  const dataSource = global.app.get(DataSource);
  const entities = dataSource.entityMetadatas;

  if (entities.length === 0) return;

  const tableNames = entities
    .map((entity) => `"${entity.tableName}"`)
    .join(', ');
  await dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
});

afterAll(async () => {
  await global.app.close();
});
