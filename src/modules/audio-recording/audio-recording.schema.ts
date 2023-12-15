import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AudioRecordingDocument = HydratedDocument<AudioRecording>;

@Schema({ timestamps: true })
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
}

export const AudioRecordingSchema =
  SchemaFactory.createForClass(AudioRecording);
