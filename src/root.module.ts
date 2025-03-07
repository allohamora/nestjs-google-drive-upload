import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigDto } from './config/config.dto';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigDto) => ({
        type: 'postgres',
        url: config.POSTGRES_URL,
        autoLoadEntities: true,
        logging: true,
        synchronize: false,
      }),
      inject: [ConfigDto],
    }),
  ],
})
export class RootModule {}
