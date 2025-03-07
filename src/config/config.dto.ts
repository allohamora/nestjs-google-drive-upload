import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsUrl, Max, Min } from 'class-validator';

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
}
