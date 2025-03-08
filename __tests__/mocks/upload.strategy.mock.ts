import { StreamableFile } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import {
  UploadResponseDto,
  UploadStrategy,
} from 'src/file/strategy/upload.strategy';

export class GoogleDriveUploadStrategyMock extends UploadStrategy {
  public provider = 'GOOGLE_DRIVE_MOCK';

  public async upload(): Promise<UploadResponseDto> {
    const providerId = randomUUID();

    return {
      providerId,
      providerUrl: `'https://example.com'/${providerId}`,
    };
  }

  public async remove(): Promise<void> {
    return;
  }

  public async download(): Promise<StreamableFile> {
    return new StreamableFile(Readable.from('test'));
  }
}
