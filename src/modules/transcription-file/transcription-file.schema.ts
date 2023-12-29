import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

import { AudioRecording } from '../audio-recording/audio-recording.schema';

import { TranscriptionLocationDto } from './dto/transcription-location.dto';

export type TranscriptionFileDocument = HydratedDocument<TranscriptionFile>;

@Schema({ timestamps: true, collection: 'ArchivoDeTranscripcion' })
export class TranscriptionFile {
  @Prop({ type: String, required: false })
  transcriptionLocation: string;

  @Prop({ type: String, required: true })
  transcription: string;

  @Prop({ type: String, required: false })
  transcriptionLocationPath: string;

  @Prop({ type: String, required: false })
  transcriptionPath: string;

  @Prop({ type: Array, required: true })
  transcriptionArray: Array<TranscriptionLocationDto>;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: AudioRecording.name,
    required: false,
  })
  audioRecording: AudioRecording;
}

export const TranscriptionFileSchema =
  SchemaFactory.createForClass(TranscriptionFile);
