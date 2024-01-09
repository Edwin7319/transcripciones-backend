import { AudioRecordingModule } from '../modules/audio-recording/audio-recording.module';
import { AuthModule } from '../modules/auth/auth.module';
import { CommandModule } from '../modules/commands/command.module';
import { LogModule } from '../modules/log/log.module';
import { RecordsModule } from '../modules/records/records.module';
import { RoleModule } from '../modules/role/role.module';
import { TranscriptionFileModule } from '../modules/transcription-file/transcription-file.module';

export const APP_MODULES = [
  AudioRecordingModule,
  CommandModule,
  TranscriptionFileModule,
  RecordsModule,
  LogModule,
  AuthModule,
  RoleModule,
];
