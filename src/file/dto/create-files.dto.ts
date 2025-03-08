import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUrl,
  MaxLength,
} from 'class-validator';

const POP_CAT_IMAGES = [
  'https://popcat.click/twitter-card.jpg',
  'https://i.pinimg.com/736x/47/80/d7/4780d793b244bb6e8fd8f90993010543.jpg',
];

export class CreateFilesDto {
  @ApiProperty({
    example: POP_CAT_IMAGES,
    description: 'The urls to the files to be uploaded',
  })
  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @MaxLength(560, { each: true })
  @IsUrl({}, { each: true })
  urls: string[];
}
