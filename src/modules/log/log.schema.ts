import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Util } from '../../utils/Util';

export enum ELogAction {
  CREATE = 'Crear',
  UPDATE = 'Actualizar',
  DELETE = 'Eliminar',
  DOWNLOAD_TXT_FILE = 'Descarga archivo TXT',
  DOWNLOAD_DOCX_FILE = 'Descarga acta Word',
}
export enum ELogSchema {
  AUDIO_RECORDING = 'registro_de_audio',
  RECORDS = 'actas',
  TRANSCRIPTION_FILE = 'archivo_de_transcripción',
}

export type LogDocument = HydratedDocument<Log>;
@Schema({ timestamps: true, collection: 'Log' })
export class Log {
  @Prop({ type: String, required: true })
  action: string;

  @Prop({ type: String, required: true })
  schema: string;

  @Prop({ type: String, required: true })
  user: string;

  @Prop({ type: Number, default: Util.getCurrentTimestamp() })
  creationTime: number;

  @Prop({ type: Object, required: false })
  previous: any;

  @Prop({ type: Object, required: true })
  current: any;
}

export const LogSchema = SchemaFactory.createForClass(Log);
