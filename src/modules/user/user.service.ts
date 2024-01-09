import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare, genSaltSync, hashSync } from 'bcrypt';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { Util } from '../../utils/Util';
import { SignInUserDto } from '../auth/dto/sign-in-user.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { EPasswordStatus, User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly _userModel: Model<User>
  ) {}

  async register(data: CreateUserDto): Promise<UserDocument> {
    const user = await this.getByEmail(data.email);

    if (user) {
      throw new ConflictException({
        message: 'El correo ya se encuentra registrado',
      });
    }

    try {
      const password = Util.generateGenericPassword(); // E0VYs+RC
      const salt = genSaltSync(10);
      const encryptPassword = hashSync(password, salt);

      return this._userModel.create({
        ...data,
        password: encryptPassword,
        passwordStatus: EPasswordStatus.GENERATED,
        roles: data.roles.map((r) => new ObjectId(r)),
      });
    } catch (e) {
      throw new InternalServerErrorException({
        message: 'Error al registrar usuario',
      });
    }
  }

  async login(data: SignInUserDto): Promise<UserDocument> {
    const user = await this.getByEmail(data.email);

    if (!user) {
      throw new NotFoundException({
        message: 'No se encontró al usuario',
      });
    }
    const matchCode = await compare(data.password, user.password);

    if (!matchCode) {
      throw new NotFoundException({
        message: 'Error en las credenciales enviadas',
      });
    }

    return user;
  }

  private getByEmail(email: string): Promise<UserDocument> {
    return this._userModel.findOne({ email }).exec();
  }
}
