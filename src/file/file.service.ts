import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private fileRepository: Repository<File>,
  ) {
    console.log(this.fileRepository);
  }
}
