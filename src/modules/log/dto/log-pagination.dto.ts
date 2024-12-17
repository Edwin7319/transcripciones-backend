import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LogPaginationDto {
  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  pageIndex: number;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  pageSize: number;

  @ApiProperty()
  @IsOptional()
  user: string;

  @ApiProperty()
  @IsOptional()
  code: string;
}
