import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class ConfigDto {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV = NodeEnv.Development;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(65535)
  @IsOptional()
  PORT: number;

  @IsUrl({
    protocols: ['postgres'],
    require_tld: false,
    require_protocol: true,
  })
  POSTGRES_URL: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  GOOGLE_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string;
}
