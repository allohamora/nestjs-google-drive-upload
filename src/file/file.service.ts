import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateFilesDto } from './dto/create-files.dto';
import { UploadResponseDto, UploadStrategy } from './strategy/upload.strategy';
import { extension } from 'mime-types';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { FileRepository } from './file.repository';
import { GetFilesDto } from './dto/get-files.dto';
import { GetFileDto } from './dto/get-file.dto';

type UploadResultDto = UploadResponseDto & {
  mimeType: string;
  url: string;
};

@Injectable()
export class FileService {
  private logger = new Logger(FileService.name);

  private strategies: Record<string, UploadStrategy> = {};

  constructor(
    private fileRepository: FileRepository,
    private uploadStrategy: UploadStrategy,
  ) {
    this.strategies[uploadStrategy.provider] = uploadStrategy;
  }

  private async urlToUploadData(url: string) {
    const res = await fetch(url);
    if (!res.body) {
      throw new UnprocessableEntityException(`invalid url: "${url}"`);
    }

    const mimeType = res.headers.get('content-type');
    if (!mimeType) {
      throw new UnprocessableEntityException(
        `invalid content-type for url: "${url}"`,
      );
    }

    const fileName = `${Date.now()}---${randomUUID()}.${extension(mimeType)}`;
    const body = Readable.fromWeb(ReadableStream.from(res.body));

    return { body, mimeType, fileName, url };
  }

  private async handleUploadResults(
    results: PromiseSettledResult<UploadResultDto>[],
  ) {
    const failed = results.filter((result) => result.status === 'rejected');
    if (!failed.length) {
      return results.map((result) => {
        // type-guard
        if (result.status === 'rejected') {
          throw new InternalServerErrorException('something went wrong');
        }

        return result.value;
      });
    }

    await Promise.all(
      results.map(async (result) => {
        if (result.status === 'fulfilled') {
          await this.uploadStrategy.remove(result.value.providerId);
        }
      }),
    );

    this.logger.error('failed to upload some files', { failed });

    throw new UnprocessableEntityException(`failed to upload some files`);
  }

  public async createFiles({ urls }: CreateFilesDto) {
    const uploadData = await Promise.all(
      urls.map(async (url) => await this.urlToUploadData(url)),
    );
    const uploadResults = await Promise.allSettled(
      uploadData.map(async (dto) => ({
        mimeType: dto.mimeType,
        url: dto.url,
        ...(await this.uploadStrategy.upload(dto)),
      })),
    );
    const resultDtos = await this.handleUploadResults(uploadResults);
    const createDtos = resultDtos.map((data) => ({
      ...data,
      provider: this.uploadStrategy.provider,
    }));

    return await this.fileRepository.createFiles(createDtos);
  }

  public async getFiles(dto: GetFilesDto) {
    return await this.fileRepository.getFiles(dto);
  }

  public async removeFiles() {
    for await (const files of this.fileRepository.iterateFiles(10)) {
      const res = await Promise.allSettled(
        files.map(async (file) => {
          const strategy = this.strategies[file.provider];
          if (!strategy) {
            throw new Error(
              `strategy for provider: "${file.provider}" is not found`,
            );
          }

          await this.strategies[file.provider].remove(file.providerId);

          return file;
        }),
      );

      const success = res
        .filter((result) => result.status !== 'rejected')
        .map((result) => result.value);
      const failed = res.length - success.length;

      if (success.length) {
        await this.fileRepository.removeFiles(success);
      }

      if (failed) {
        this.logger.error('failed to remove some files', {
          failed: res.filter((result) => result.status === 'rejected'),
        });

        throw new InternalServerErrorException('some files were not removed');
      }
    }
  }

  public async downloadFile({ id }: GetFileDto) {
    const file = await this.fileRepository.getFile(id);
    if (!file) {
      throw new NotFoundException(`file with id: "${id}" not found`);
    }

    const strategy = this.strategies[file.provider];
    if (!strategy) {
      throw new InternalServerErrorException(
        `strategy for provider: "${file.provider}" is not found`,
      );
    }

    return await strategy.download(file.providerId);
  }
}
