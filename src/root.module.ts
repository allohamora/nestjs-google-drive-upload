import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source.options';
import { FileModule } from './file/file.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forRoot(dataSourceOptions), FileModule],
})
export class RootModule {}
