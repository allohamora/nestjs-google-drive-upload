import { Repository } from 'typeorm';
import { File } from './file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { GetFilesDto } from './dto/get-files.dto';

export class FileRepository {
  constructor(
    @InjectRepository(File)
    private repository: Repository<File>,
  ) {}

  public async createFiles(data: Partial<File>[]) {
    const entities = this.repository.create(data);

    return await this.repository.save(entities);
  }

  public async getFiles({ limit, offset }: GetFilesDto) {
    return await this.repository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
