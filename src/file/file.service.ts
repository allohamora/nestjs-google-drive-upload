import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFilesDto } from './dto/create-files.dto';
import {
  UploadDto,
  UploadResultDto,
  UploadStrategy,
} from './strategy/upload.strategy';
import { extension } from 'mime-types';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { ReadableStream } from 'node:stream/web';
import { File } from './file.entity';

@Injectable()
export class FileService {
  private logger = new Logger(FileService.name);

  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
    private uploadStrategy: UploadStrategy,
  ) {}

  private async linkToUploadDto(link: string) {
    const res = await fetch(link);
    if (!res.body) {
      throw new BadRequestException(`invalid link: "${link}"`);
    }

    const mimeType = res.headers.get('content-type');
    if (!mimeType) {
      throw new BadRequestException(`invalid content-type for link: "${link}"`);
    }

    const fileName = `${Date.now()}---${randomUUID()}.${extension(mimeType)}`;
    const body = Readable.fromWeb(ReadableStream.from(res.body));

    return { body, mimeType, fileName } satisfies UploadDto;
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
          await this.uploadStrategy.remove(result.value.id);
        }
      }),
    );

    this.logger.error('failed to upload some files', { failed });

    throw new BadRequestException(`failed to upload some files`);
  }

  public async createFiles({ links }: CreateFilesDto) {
    const uploadDtos = await Promise.all(
      links.map(async (link) => await this.linkToUploadDto(link)),
    );
    const uploadResults = await Promise.allSettled(
      uploadDtos.map(async (dto) => await this.uploadStrategy.upload(dto)),
    );
    const resultDtos = await this.handleUploadResults(uploadResults);

    return await this.fileRepository.save(
      resultDtos.map(({ url, id }) =>
        this.fileRepository.create({
          url,
          provider: this.uploadStrategy.provider,
          providerId: id,
        }),
      ),
    );
  }
}
