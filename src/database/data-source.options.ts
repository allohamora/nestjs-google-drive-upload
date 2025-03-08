import { join } from 'node:path';
import { config } from '../config/config.module';
import { DataSourceOptions } from 'typeorm';
import { NamingStrategy } from './naming.strategy';
import { NodeEnv } from 'src/config/config.dto';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: config.POSTGRES_URL,
  entities: [join(__dirname, '..', '/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],
  namingStrategy: new NamingStrategy(),
  migrationsRun: true,
  logging: config.NODE_ENV === NodeEnv.Development,
  synchronize: false,
};
