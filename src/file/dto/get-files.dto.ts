import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetFilesDto {
  @Type(() => Number)
  @IsInt()
  @ApiProperty({ required: false, default: 50, type: Number })
  limit = 50;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false })
  offset?: number;
}
