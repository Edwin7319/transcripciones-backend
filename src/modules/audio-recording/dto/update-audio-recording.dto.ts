import { IsOptional, IsString } from 'class-validator';

import { EAudioRecordingStatus } from '../audio-recording.schema';

export class UpdateAudioRecordingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  processStatus?: EAudioRecordingStatus;
}
