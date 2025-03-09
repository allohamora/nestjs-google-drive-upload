import { HttpStatus, StreamableFile } from '@nestjs/common';
import { CreateFilesDto } from 'src/file/dto/create-files.dto';
import { GetFilesDto } from 'src/file/dto/get-files.dto';
import { File } from 'src/file/file.entity';
import { FileRepository } from 'src/file/file.repository';
import {
  UploadDto,
  UploadResponseDto,
  UploadStrategy,
} from 'src/file/strategy/upload.strategy';
import { ReadableStream } from 'node:stream/web';
import { Readable } from 'node:stream';
import { GetFileDto } from 'src/file/dto/get-file.dto';
import { randomUUID } from 'node:crypto';

export const expectResStatus = (
  status: number,
  res: { statusCode: number; body: unknown },
): void => {
  if (status !== res.statusCode) {
    console.error(res.body);
  }

  expect(res.statusCode).toBe(status);
};

export const expectRes = (
  status: number,
  res: { statusCode: number; body: unknown },
): void => {
  expectResStatus(status, res);
  expect(res).toSatisfyApiSpec();
};

describe('FileController (e2e)', () => {
  let uploadStrategy: UploadStrategy;

  let uploadSpy: jest.SpyInstance<Promise<UploadResponseDto>, [dto: UploadDto]>;
  let removeSpy: jest.SpyInstance<Promise<void>, [id: string]>;
  let downloadSpy: jest.SpyInstance<Promise<StreamableFile>, [id: string]>;

  let fetchMock: jest.SpyInstance<
    Promise<Response>,
    [input: string | URL | globalThis.Request, init?: RequestInit]
  >;

  let fileRepository: FileRepository;

  beforeAll(() => {
    uploadStrategy = app.get(UploadStrategy);
    fileRepository = app.get(FileRepository);
  });

  beforeEach(() => {
    uploadSpy = jest
      .spyOn(uploadStrategy, 'upload')
      .mockImplementation(jest.fn());
    removeSpy = jest
      .spyOn(uploadStrategy, 'remove')
      .mockImplementation(jest.fn());
    downloadSpy = jest
      .spyOn(uploadStrategy, 'download')
      .mockImplementation(jest.fn());

    fetchMock = jest.spyOn(global, 'fetch').mockImplementation(jest.fn());
  });

  afterEach(() => {
    uploadSpy.mockRestore();
    removeSpy.mockRestore();
    downloadSpy.mockRestore();

    fetchMock.mockRestore();
  });

  const getFiles = async (
    dto: Partial<GetFilesDto>,
    status = HttpStatus.OK,
  ) => {
    const res = await request(app.getHttpServer()).get('/v1/files').query(dto);

    expectRes(status, res);

    return res.body as File[];
  };

  const createFiles = async (
    dto: Partial<CreateFilesDto>,
    status = HttpStatus.CREATED,
  ) => {
    const res = await request(app.getHttpServer()).post('/v1/files').send(dto);

    expectRes(status, res);

    return res.body as File[];
  };

  const downloadFile = async (dto: GetFileDto, status = HttpStatus.OK) => {
    const res = await request(app.getHttpServer()).get(
      `/v1/files/${dto.id}/download`,
    );

    expectResStatus(status, res);

    return { body: res.body as Buffer, headers: res.headers };
  };

  const deleteAllFiles = async (status = HttpStatus.NO_CONTENT) => {
    const res = await request(app.getHttpServer()).delete('/v1/files/all');

    expectRes(status, res);

    return res.body;
  };

  const mockResponse = (data?: Partial<Response>) =>
    ({
      body: ReadableStream.from([]),
      headers: new Headers({ 'content-type': 'test' }),
      ...data,
    }) as unknown as Response;

  describe('GET /v1/files', () => {
    it('returns a list of files', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: 'TEST',
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'text/plain',
      };

      const created = await fileRepository.createFiles(
        Array.from({ length: 3 }, () => fileData),
      );

      const files = await getFiles({}, HttpStatus.OK);
      expect(files).toHaveLength(created.length);

      for (const file of files) {
        expect(file).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            createdAt: expect.any(String),
            url: fileData.url,
            providerUrl: fileData.providerUrl,
            providerViewUrl: fileData.providerViewUrl,
          }),
        );
        expect(file).not.toHaveProperty('providerId');
        expect(file).not.toHaveProperty('mimeType');
        expect(file).not.toHaveProperty('provider');
      }
    });

    it('applies limit', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: 'TEST',
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'text/plain',
      };

      await fileRepository.createFiles([
        { ...fileData, url: 'test1' },
        { ...fileData, url: 'test1' },
        { ...fileData, url: 'test2' },
      ]);

      const files = await getFiles({ limit: 2 }, HttpStatus.OK);
      expect(files).toHaveLength(2);

      for (const file of files) {
        expect(file).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            createdAt: expect.any(String),
            url: 'test1',
            providerUrl: fileData.providerUrl,
            providerViewUrl: fileData.providerViewUrl,
          }),
        );
        expect(file).not.toHaveProperty('providerId');
        expect(file).not.toHaveProperty('mimeType');
        expect(file).not.toHaveProperty('provider');
      }
    });

    it('applies offset', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: 'TEST',
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'text/plain',
      };

      await fileRepository.createFiles([
        { ...fileData, url: 'test1' },
        { ...fileData, url: 'test2' },
      ]);

      const files = await getFiles({ offset: 1 }, HttpStatus.OK);
      expect(files).toHaveLength(1);

      const [file] = files;
      expect(file).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(String),
          url: 'test2',
          providerUrl: fileData.providerUrl,
          providerViewUrl: fileData.providerViewUrl,
        }),
      );
    });

    it('applies limit and offset', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: 'TEST',
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'text/plain',
      };

      await fileRepository.createFiles([
        { ...fileData, url: 'test1' },
        { ...fileData, url: 'test2' },
        { ...fileData, url: 'test3' },
      ]);

      const limit = 1;
      const offset = 1;

      const files = await getFiles({ limit, offset }, HttpStatus.OK);
      expect(files).toHaveLength(limit);

      const [file] = files;
      expect(file).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(String),
          url: 'test2',
          providerUrl: fileData.providerUrl,
          providerViewUrl: fileData.providerViewUrl,
        }),
      );
    });

    it('validates query', async () => {
      await getFiles({ limit: NaN }, HttpStatus.BAD_REQUEST);
      await getFiles({ offset: NaN }, HttpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/files', () => {
    it('uploads files', async () => {
      const urls = ['https://example.com/1', 'https://example.com/2'];

      uploadSpy.mockImplementation(async () => ({
        providerUrl: 'test',
        providerViewUrl: 'test',
        providerId: 'test',
      }));

      fetchMock.mockImplementation(async () =>
        mockResponse({ headers: new Headers({ 'content-type': 'test' }) }),
      );

      const files = await createFiles({ urls }, HttpStatus.CREATED);
      expect(files).toHaveLength(urls.length);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        expect(file).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            createdAt: expect.any(String),
            url: urls[i],
            providerUrl: 'test',
            providerViewUrl: 'test',
          }),
        );
        expect(file).not.toHaveProperty('providerId');
        expect(file).not.toHaveProperty('mimeType');
        expect(file).not.toHaveProperty('provider');
      }

      const createdFiles = await fileRepository.getFiles({ limit: 50 });
      expect(createdFiles).toHaveLength(urls.length);

      for (let i = 0; i < createdFiles.length; i++) {
        const file = createdFiles[i];

        expect(file).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            url: urls[i],
            mimeType: 'test',
            provider: uploadStrategy.provider,
            providerUrl: 'test',
            providerViewUrl: 'test',
            providerId: 'test',
            createdAt: expect.any(Date),
          }),
        );
      }

      expect(uploadSpy).toHaveBeenCalledTimes(urls.length);
    });

    it('uploads files without providerViewUrl', async () => {
      const urls = ['https://example.com/1', 'https://example.com/2'];

      uploadSpy.mockImplementation(async () => ({
        providerUrl: 'test',
        providerId: 'test',
      }));

      fetchMock.mockImplementation(async () =>
        mockResponse({ headers: new Headers({ 'content-type': 'test' }) }),
      );

      const files = await createFiles({ urls }, HttpStatus.CREATED);
      expect(files).toHaveLength(urls.length);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        expect(file).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            createdAt: expect.any(String),
            url: urls[i],
            providerUrl: 'test',
            providerViewUrl: null,
          }),
        );
        expect(file).not.toHaveProperty('providerId');
        expect(file).not.toHaveProperty('mimeType');
        expect(file).not.toHaveProperty('provider');
      }

      const createdFiles = await fileRepository.getFiles({ limit: 50 });
      expect(createdFiles).toHaveLength(urls.length);

      for (let i = 0; i < createdFiles.length; i++) {
        const file = createdFiles[i];

        expect(file).toEqual(
          expect.objectContaining({
            id: expect.any(String),
            url: urls[i],
            mimeType: 'test',
            provider: uploadStrategy.provider,
            providerUrl: 'test',
            providerViewUrl: null,
            providerId: 'test',
            createdAt: expect.any(Date),
          }),
        );
      }

      expect(uploadSpy).toHaveBeenCalledTimes(urls.length);
    });

    it('removes uploaded files if one fails', async () => {
      const urls = ['https://example.com/1', 'https://example.com/2'];
      let calls = 0;

      uploadSpy.mockImplementation(async () => {
        if (calls++ === 1) {
          throw new Error('test');
        }

        return {
          providerUrl: 'test',
          providerViewUrl: 'test',
          providerId: 'test',
        };
      });

      fetchMock.mockImplementation(async () => mockResponse());

      await createFiles({ urls }, HttpStatus.INTERNAL_SERVER_ERROR);

      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it('handles internal upload errors', async () => {
      uploadSpy.mockImplementation(async () => {
        throw new Error('test');
      });

      fetchMock.mockImplementation(async () => mockResponse());

      await createFiles(
        { urls: ['https://example.com/1'] },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    it('handles missing body', async () => {
      fetchMock.mockImplementation(async () => mockResponse({ body: null }));

      await createFiles(
        { urls: ['https://example.com/1'] },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    });

    it('handles missing mimeType', async () => {
      fetchMock.mockImplementation(async () =>
        mockResponse({ headers: new Headers() }),
      );

      await createFiles(
        { urls: ['https://example.com/1'] },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    });

    it('validates body', async () => {
      await createFiles({ urls: [] }, HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/files/:id/download', () => {
    it('downloads a file', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: uploadStrategy.provider,
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'application/octet-stream',
      };

      const [file] = await fileRepository.createFiles([fileData]);

      downloadSpy.mockImplementation(
        async () => new StreamableFile(Readable.from('test')),
      );

      const res = await downloadFile({ id: file.id }, HttpStatus.OK);
      expect(res.body).toEqual(Buffer.from('test'));
    });

    it('handles missing provider', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: randomUUID(),
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'application/octet-stream',
      };

      const [file] = await fileRepository.createFiles([fileData]);

      await downloadFile({ id: file.id }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('handles internal errors', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: uploadStrategy.provider,
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'application/octet-stream',
      };

      const [file] = await fileRepository.createFiles([fileData]);

      downloadSpy.mockImplementation(async () => {
        throw new Error('test');
      });

      await downloadFile({ id: file.id }, HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('handles not found file', async () => {
      await downloadFile({ id: randomUUID() }, HttpStatus.NOT_FOUND);
    });

    it('sets correct content type header', async () => {
      const mimeType = 'application/pdf';
      const fileData = {
        url: 'https://example.com',
        provider: uploadStrategy.provider,
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType,
      };

      const [file] = await fileRepository.createFiles([fileData]);
      const testContent = 'test content';

      downloadSpy.mockImplementation(
        async () =>
          new StreamableFile(Readable.from(testContent), { type: mimeType }),
      );

      const res = await downloadFile({ id: file.id }, HttpStatus.OK);

      expect(res.headers['content-type']).toEqual(mimeType);
      expect(res.body.toString('utf-8')).toEqual(testContent);
      expect(downloadSpy).toHaveBeenCalledWith(file.providerId);
    });
  });

  describe('DELETE /v1/files', () => {
    it('removes files', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: uploadStrategy.provider,
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'application/octet-stream',
      };

      const files = await fileRepository.createFiles(
        Array.from({ length: 3 }, () => fileData),
      );

      await deleteAllFiles(HttpStatus.NO_CONTENT);

      const createdFiles = await fileRepository.getFiles({ limit: 50 });
      expect(createdFiles).toHaveLength(0);

      expect(removeSpy).toHaveBeenCalledTimes(files.length);
    });

    it('removes success removed files and throws an exception', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: uploadStrategy.provider,
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'application/octet-stream',
      };

      const files = await fileRepository.createFiles(
        Array.from({ length: 3 }, () => fileData),
      );

      let calls = 0;

      removeSpy.mockImplementation(async () => {
        if (++calls === files.length) {
          throw new Error('test');
        }
      });

      await deleteAllFiles(HttpStatus.INTERNAL_SERVER_ERROR);

      const existed = await fileRepository.getFiles({ limit: 50 });
      expect(existed).toHaveLength(1);

      expect(removeSpy).toHaveBeenCalledTimes(files.length);
    });

    it('handles internal errors', async () => {
      const fileData = {
        url: 'https://example.com',
        provider: uploadStrategy.provider,
        providerUrl: 'https://example.com',
        providerViewUrl: 'https://example.com/view',
        providerId: 'test',
        mimeType: 'application/octet-stream',
      };

      await fileRepository.createFiles([fileData]);

      removeSpy.mockImplementation(async () => {
        throw new Error('test');
      });

      await deleteAllFiles(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
