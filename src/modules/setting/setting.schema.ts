import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { Util } from '../../utils/Util';
import { EStatus } from '../../shared/enum';



export type SettingDocument = HydratedDocument<Setting>;

@Schema({ timestamps: true, collection: 'Configuracion' })
export class Setting {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  value: string;

  @Prop({ type: String, required: false, default: EStatus.ENABLED })
  status: EStatus;

  @Prop({ type: Number, default: Util.getCurrentTimestamp() })
  creationTime: number;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
