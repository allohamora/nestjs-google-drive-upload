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

  public async *iterateFiles(take: number) {
    let skip = 0;

    while (true) {
      const files = await this.repository.find({
        order: { createdAt: 'DESC' },
        // we request one more item to check if there are more items instead of making an additional request
        take: take + 1,
        skip,
      });

      if (!files.length) {
        break;
      }

      yield files.slice(0, take);

      skip += take;

      if (files.length <= take) {
        break;
      }
    }
  }

  public async removeFiles(files: File[]) {
    // if you use a .remove method, then typeorm will make an additional request to select all entities
    await this.repository.delete(files.map(({ id }) => id));
  }

  public async getFile(id: string) {
    return this.repository.findOne({ where: { id } });
  }
}
