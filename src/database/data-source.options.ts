import { join } from 'node:path';
import { config } from '../config/config.module';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: config.POSTGRES_URL,
  entities: [join(__dirname, '..', '/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  namingStrategy: new SnakeNamingStrategy(),
  migrationsRun: true,
  logging: true,
  synchronize: false,
};
