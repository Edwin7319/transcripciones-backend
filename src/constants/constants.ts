import { AudioRecordingModule } from '../modules/audio-recording/audio-recording.module';
import { CommandModule } from '../modules/commands/command.module';
import { TranscriptionFileModule } from '../modules/transcription-file/transcription-file.module';

export const APP_MODULES = [
  AudioRecordingModule,
  CommandModule,
  TranscriptionFileModule,
];
