import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AudioRecordingController } from './audio-recording.controller';
import { AudioRecording, AudioRecordingSchema } from './audio-recording.schema';
import { AudioRecordingService } from './audio-recording.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AudioRecording.name,
        schema: AudioRecordingSchema,
      },
    ]),
  ],
  controllers: [AudioRecordingController],
  providers: [AudioRecordingService],
})
export class AudioRecordingModule {}
