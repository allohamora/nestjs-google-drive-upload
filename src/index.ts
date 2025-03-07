import { NestFactory } from '@nestjs/core';
import { RootModule } from './root.module';
import { config } from './config/config.module';

const bootstrap = async () => {
  const app = await NestFactory.create(RootModule);

  await app.listen(config.PORT);
};

bootstrap();
