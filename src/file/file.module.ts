import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { FileController } from './file.controller';
import { UploadStrategy } from './strategy/upload.strategy';
import { GoogleDriveUploadStrategy } from './strategy/google-drive.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [
    { provide: UploadStrategy, useClass: GoogleDriveUploadStrategy },
    FileService,
  ],
})
export class FileModule {}
