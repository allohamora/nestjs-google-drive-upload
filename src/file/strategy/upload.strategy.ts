import { Readable } from 'node:stream';

export type UploadDto = {
  fileName: string;
  mimeType: string;
  body: Readable;
};

export type UploadResultDto = {
  url: string;
  id: string;
};

export abstract class UploadStrategy {
  public abstract provider: string;

  public abstract upload(dto: UploadDto): Promise<UploadResultDto>;
  public abstract remove(id: string): Promise<void>;
}
