import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

import { EStatus } from '../../shared/enum';
import { Util } from '../../utils/Util';
import { Role } from '../role/role.schema';

export enum EPasswordStatus {
  GENERATED = 'Generada',
  RECOVERY = 'Recuperada',
  VALIDATED = 'Validada',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'Usuario' })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: false, default: EStatus.ENABLED })
  status: EStatus;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  passwordStatus: EPasswordStatus;

  @Prop({ type: String, required: false })
  institution: string;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Role.name,
        required: true,
      },
    ],
  })
  roles: Array<string>;

  @Prop({ type: Number, default: Util.getCurrentTimestamp() })
  creationTime: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
