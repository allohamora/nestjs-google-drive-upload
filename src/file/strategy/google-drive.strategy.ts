import {
  UploadDto,
  UploadResponseDto,
  UploadStrategy,
} from './upload.strategy';
import { drive, auth } from '@googleapis/drive';
import type { drive_v3 } from '@googleapis/drive';
import {
  Injectable,
  Logger,
  OnModuleInit,
  StreamableFile,
} from '@nestjs/common';
import { ConfigDto } from 'src/config/config.dto';

const FOLDER_NAME = 'uploads';

@Injectable()
export class GoogleDriveUploadStrategy
  extends UploadStrategy
  implements OnModuleInit
{
  public provider = 'GOOGLE_DRIVE';

  private api: drive_v3.Drive;

  private logger = new Logger(GoogleDriveUploadStrategy.name);

  private folderId: string;

  constructor(config: ConfigDto) {
    super();

    const googleAuth = new auth.GoogleAuth({
      credentials: {
        client_email: config.GOOGLE_EMAIL,
        client_id: config.GOOGLE_CLIENT_ID,
        private_key: config.GOOGLE_PRIVATE_KEY,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.api = drive({
      version: 'v3',
      auth: googleAuth,
    });
  }

  public async onModuleInit() {
    this.folderId = await this.getFolderId();
  }

  private async getFolderId(): Promise<string> {
    const res = await this.api.files.list({ q: `name='${FOLDER_NAME}'` });
    if (!res.data.files?.length) {
      throw new Error(
        `folder: ${FOLDER_NAME} is not found in your google drive, make sure you shared it with the service account`,
      );
    }

    if (res.data.files.length > 1) {
      this.logger.warn(
        `found multiple folders with the name: ${FOLDER_NAME}, using the first one`,
      );
    }

    const [folder] = res.data.files;
    if (!folder.id) {
      throw new Error(
        `folder does not have an id, folder: ${JSON.stringify(folder, null, 2)}`,
      );
    }

    return folder.id;
  }

  public override async upload({
    fileName,
    mimeType,
    body,
  }: UploadDto): Promise<UploadResponseDto> {
    const res = await this.api.files.create({
      requestBody: {
        name: fileName,
        parents: [this.folderId],
      },
      media: {
        mimeType,
        body,
      },
      fields: 'id',
    });

    const providerId = res.data.id;
    if (!providerId) {
      throw new Error(
        `failed to upload file: ${fileName}, data: ${JSON.stringify(res.data)}`,
      );
    }

    const providerUrl = `https://drive.google.com/uc?id=${providerId}`;

    return { providerUrl, providerId };
  }

  public override async remove(id: string): Promise<void> {
    await this.api.files.delete({ fileId: id });
  }

  public override async download(id: string): Promise<StreamableFile> {
    const res = await this.api.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'stream' },
    );

    const disposition =
      (res.headers['content-disposition'] as string) ?? undefined;
    const contentLength = res.headers['content-length'] as string;
    const length = contentLength ? Number(contentLength) : undefined;
    const type = (res.headers['content-type'] as string) ?? undefined;

    return new StreamableFile(res.data, { disposition, length, type });
  }
}
