import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CommandModule } from '../commands/command.module';
import { EmailModule } from '../email/email.module';
import { Log, LogSchema } from '../log/log.schema';
import { TranscriptionFileModule } from '../transcription-file/transcription-file.module';
import { UserModule } from '../user/user.module';

import { AudioRecordingController } from './audio-recording.controller';
import { AudioRecording, AudioRecordingSchema } from './audio-recording.schema';
import { AudioRecordingService } from './audio-recording.service';

@Module({
  imports: [
    TranscriptionFileModule,
    CommandModule,
    EmailModule,
    UserModule,
    MongooseModule.forFeature([
      {
        name: AudioRecording.name,
        schema: AudioRecordingSchema,
      },
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
  ],
  controllers: [AudioRecordingController],
  providers: [AudioRecordingService],
})
export class AudioRecordingModule {}
