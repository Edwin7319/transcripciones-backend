import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAudioRecordingDto {
  @IsNotEmpty()
  @IsString()
    name: string;
}
