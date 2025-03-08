import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetFileDto {
  @IsUUID()
  @ApiProperty({ example: 'e7b58160-afa3-4228-905e-677bd26bc100' })
  id: string;
}
