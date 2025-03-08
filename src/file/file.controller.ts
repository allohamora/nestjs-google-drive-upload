import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { File } from './file.entity';
import { CreateFilesDto } from './dto/create-files.dto';
import { FileService } from './file.service';
import { GetFilesDto } from './dto/get-files.dto';
import {
  ApiErrorBadRequestResponse,
  ApiErrorInternalServerErrorResponse,
  ApiErrorNotFoundResponse,
  ApiErrorUnprocessableEntityResponse,
} from 'src/response/response.decorator';
import { GetFileDto } from './dto/get-file.dto';

@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Get()
  @ApiOperation({ summary: 'get all files' })
  @ApiErrorBadRequestResponse({ description: 'validation was failed' })
  @ApiOkResponse({
    description: 'files were received',
    type: File,
    isArray: true,
  })
  public async getFiles(@Query() dto: GetFilesDto) {
    return this.fileService.getFiles(dto);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'for usage inside <img > tag' })
  @ApiOkResponse({
    description: 'file stream was received',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiErrorBadRequestResponse({ description: 'validation was failed' })
  @ApiErrorInternalServerErrorResponse({ description: 'something went wrong' })
  @ApiErrorNotFoundResponse({ description: 'file was not found' })
  public async downloadFile(@Param() dto: GetFileDto) {
    return this.fileService.downloadFile(dto);
  }

  @Post()
  @ApiOperation({ summary: 'create new files' })
  @ApiCreatedResponse({
    description: 'files were created',
    type: File,
    isArray: true,
  })
  @ApiErrorBadRequestResponse({ description: 'validation was failed' })
  @ApiErrorUnprocessableEntityResponse({ description: 'processing was failed' })
  @ApiErrorInternalServerErrorResponse({ description: 'something went wrong' })
  public async createFiles(@Body() dto: CreateFilesDto) {
    return this.fileService.createFiles(dto);
  }

  @HttpCode(204)
  @Delete()
  @ApiOperation({ summary: 'remove all files' })
  @ApiNoContentResponse({ description: 'files were removed' })
  @ApiErrorInternalServerErrorResponse({ description: 'something went wrong' })
  public async removeFiles() {
    return this.fileService.removeFiles();
  }
}
