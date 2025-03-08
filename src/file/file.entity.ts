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

  @ApiProperty({ example: 'https://example.com/file/d/122fas0' })
  @Column({ type: 'varchar', length: 560 })
  url: string;

  @Exclude()
  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Exclude()
  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @ApiProperty({ example: 'https://drive.google.com/file/d/e7b58160' })
  @Column({ type: 'varchar', length: 560 })
  providerUrl: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  providerId: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
