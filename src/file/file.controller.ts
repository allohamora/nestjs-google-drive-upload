import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { File } from './file.entity';
import { CreateFilesDto } from './dto/create-files.dto';
import { FileService } from './file.service';
import { GetFilesDto } from './dto/get-files.dto';

@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Get()
  @ApiOkResponse({ description: 'Get files', type: File, isArray: true })
  public async getFiles(@Query() dto: GetFilesDto) {
    return this.fileService.getFiles(dto);
  }

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
