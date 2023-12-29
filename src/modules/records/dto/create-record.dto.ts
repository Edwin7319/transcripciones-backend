import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecordDto {
  @IsNotEmpty()
  @IsString()
    text: string;

  @IsNotEmpty()
  @IsString()
    name: string;

  @IsNotEmpty()
  @IsString()
    fileId: string;
}
