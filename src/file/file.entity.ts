import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class File {
  @ApiProperty({ example: 'e7b58160-afa3-4228-905e-677bd26bc100' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'https://drive.google.com/file/d/e7b58160' })
  @Column({ type: 'text' })
  url: string;

  @Exclude()
  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true })
  providerId?: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
