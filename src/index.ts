import { NestFactory } from '@nestjs/core';
import { RootModule } from './root.module';
import { bootstrap } from './bootstrap';

const main = async () => {
  const app = await NestFactory.create(RootModule);

  await bootstrap(app);
};

void main();
