import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateAudioRecordingDto {
  @IsNotEmpty()
  @IsString()
    name: string;

  @IsNotEmpty()
  @IsNumberString()
    duration: string;
}
