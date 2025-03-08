import { plainToClass } from 'class-transformer';
import { TypedConfigModule } from 'nest-typed-config';
import { ConfigDto } from 'src/config/config.dto';

const configDtoMock = plainToClass(ConfigDto, {
  NODE_ENV: 'test',
  PORT: 4000,
  POSTGRES_URL: 'postgres://app:example@localhost:5432/test',
  GOOGLE_EMAIL: 'test@example.com',
  GOOGLE_PRIVATE_KEY: 'test',
  GOOGLE_CLIENT_ID: 'test',
});

jest.mock('src/config/config.module', () => ({
  ConfigModule: TypedConfigModule.forRoot({
    schema: ConfigDto,
    load: () => configDtoMock,
  }),
  config: configDtoMock,
}));
