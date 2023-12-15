import { IsOptional, IsString } from 'class-validator';

export class UpdateAudioRecordingDto {
  @IsOptional()
  @IsString()
    name: string;
}
