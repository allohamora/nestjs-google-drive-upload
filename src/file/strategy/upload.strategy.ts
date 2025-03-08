import { StreamableFile } from '@nestjs/common';
import { Readable } from 'node:stream';

export type UploadDto = {
  fileName: string;
  mimeType: string;
  body: Readable;
};

export type UploadResponseDto = {
  providerUrl: string;
  providerId: string;
};

export abstract class UploadStrategy {
  public abstract provider: string;

  public abstract upload(dto: UploadDto): Promise<UploadResponseDto>;
  public abstract remove(id: string): Promise<void>;
  public abstract download(id: string): Promise<StreamableFile>;
}
