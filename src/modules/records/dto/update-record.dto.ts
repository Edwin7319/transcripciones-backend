import { IsOptional, IsString } from 'class-validator';

export class UpdateRecordDto {
  @IsOptional()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  name: string;
}
