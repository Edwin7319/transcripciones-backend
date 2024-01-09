import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { EStatus } from '../../shared/enum';

export type RoleDocument = HydratedDocument<Role>;
@Schema({ timestamps: true, collection: 'Rol' })
export class Role {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: true, default: EStatus.ENABLED })
  status: EStatus;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
