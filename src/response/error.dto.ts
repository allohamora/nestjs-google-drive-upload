import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({ example: ['validation was failed'] })
  messages: string[];

  @ApiProperty({ example: 400 })
  status: number;
}
