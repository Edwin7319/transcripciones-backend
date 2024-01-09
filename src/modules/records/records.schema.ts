import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { TranscriptionFile } from '../transcription-file/transcription-file.schema';

export type RecordsDocument = HydratedDocument<Records>;
@Schema({ timestamps: true, collection: 'Actas' })
export class Records {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Number, required: true })
  creationTime: number;

  @Prop({ type: String, required: false })
  previousText: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: TranscriptionFile.name,
    required: false,
  })
  transcriptionFile: TranscriptionFile;
}

export const RecordsSchema = SchemaFactory.createForClass(Records);
