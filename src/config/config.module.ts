// config.module.ts
import {
  TypedConfigModule,
  dotenvLoader,
  selectConfig,
} from 'nest-typed-config';
import { ConfigDto } from './config.dto';

export const ConfigModule = TypedConfigModule.forRoot({
  isGlobal: true,
  schema: ConfigDto,
  load: dotenvLoader(),
});

export const config = selectConfig(ConfigModule, ConfigDto);
