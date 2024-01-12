import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { User } from '../user/user.schema';

export enum EAudioRecordingStatus {
  CREATED = 'CREADO',
  COMPLETED = 'COMPLETO',
  ERROR = 'ERROR',
}

export type AudioRecordingDocument = HydratedDocument<AudioRecording>;

@Schema({ timestamps: true, collection: 'InformacionDeAudio' })
export class AudioRecording {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  originalName: string;

  @Prop({ type: Number, required: false })
  size: string;

  @Prop({ type: String, required: true })
  path: string;

  @Prop({ type: String, required: false })
  destination: string;

  @Prop({ type: Number, required: true })
  creationTime: number;

  @Prop({ type: String, required: false })
  copyName: string;

  @Prop({ type: String, required: false })
  destinationCopy: string;

  @Prop({ type: String, required: false })
  pathCopy: string;

  @Prop({ type: Number, required: true })
  duration: number;

  @Prop({ type: String, required: true })
  status: EAudioRecordingStatus;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: false,
  })
  user: User;
}

export const AudioRecordingSchema =
  SchemaFactory.createForClass(AudioRecording);
