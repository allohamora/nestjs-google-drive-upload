import { NestFactory } from '@nestjs/core';
import { RootModule } from './root.module';

const bootstrap = async () => {
  const app = await NestFactory.create(RootModule);

  await app.listen(process.env.PORT ?? 3000);
};

bootstrap();
