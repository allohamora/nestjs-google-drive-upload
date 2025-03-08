import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { File } from './file.entity';
import { CreateFilesDto } from './dto/create-files.dto';
import { FileService } from './file.service';
import { GetFilesDto } from './dto/get-files.dto';
import {
  ApiErrorBadRequestResponse,
  ApiErrorInternalServerErrorResponse,
  ApiErrorUnprocessableEntityResponse,
} from 'src/response/response.decorator';

@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @Get()
  @ApiErrorBadRequestResponse({ description: 'validation was failed' })
  @ApiOkResponse({
    description: 'files were received',
    type: File,
    isArray: true,
  })
  public async getFiles(@Query() dto: GetFilesDto) {
    return this.fileService.getFiles(dto);
  }

  @Post()
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
  @ApiNoContentResponse({ description: 'files were removed' })
  @ApiErrorInternalServerErrorResponse({ description: 'something went wrong' })
  public async removeFiles() {
    return this.fileService.removeFiles();
  }
}
