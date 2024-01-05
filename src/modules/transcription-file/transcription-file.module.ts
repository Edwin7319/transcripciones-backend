import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Log, LogSchema } from '../log/log.schema';

import { TranscriptionFileController } from './transcription-file.controller';
import {
  TranscriptionFile,
  TranscriptionFileSchema,
} from './transcription-file.schema';
import { TranscriptionFileService } from './transcription-file.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TranscriptionFile.name,
        schema: TranscriptionFileSchema,
      },
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
  ],
  providers: [TranscriptionFileService],
  controllers: [TranscriptionFileController],
  exports: [TranscriptionFileService],
})
export class TranscriptionFileModule {}
