import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { File } from './file.entity';
import { CreateFilesDto } from './dto/create-files.dto';
import { FileService } from './file.service';

@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Create files',
    type: File,
    isArray: true,
  })
  public async createFiles(@Body() dto: CreateFilesDto) {
    return this.fileService.createFiles(dto);
  }
}
