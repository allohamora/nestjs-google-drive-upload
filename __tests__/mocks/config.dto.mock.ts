import { plainToClass } from 'class-transformer';
import { ConfigDto } from 'src/config/config.dto';

export const configDtoMock = plainToClass(ConfigDto, {
  NODE_ENV: 'test',
  PORT: 4000,
  POSTGRES_URL: 'postgres://app:example@localhost:5432/test',
  GOOGLE_EMAIL: 'test',
  GOOGLE_PRIVATE_KEY: 'test',
  GOOGLE_CLIENT_ID: 'test',
});
