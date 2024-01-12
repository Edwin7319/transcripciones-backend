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
import {
  RecoverPasswordDto,
  UpdatePasswordDto,
} from '../auth/dto/update-password.dto';
import { EmailService } from '../email/email.service';

import { CreateUserDto } from './dto/create-user.dto';
import { EPasswordStatus, User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly _userModel: Model<User>,
    private readonly _emailService: EmailService
  ) {}

  async register(data: CreateUserDto): Promise<UserDocument> {
    const user = await this.getByEmail(data.email);

    if (user) {
      throw new ConflictException({
        message: 'El correo ya se encuentra registrado',
      });
    }

    try {
      const encryptPassword = this.generateEncryptedPass(
        Util.generateGenericPassword()
      );

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
        message: 'Credenciales no validas',
      });
    }

    return user;
  }

  async updatePassword(data: UpdatePasswordDto): Promise<UserDocument> {
    const { password, email, newPassword } = data;
    const user = await this.login({
      password,
      email,
    });
    const encryptPassword = this.generateEncryptedPass(newPassword);

    await this._userModel.updateOne(
      {
        _id: user._id,
      },
      {
        password: encryptPassword,
        passwordStatus: EPasswordStatus.VALIDATED,
      }
    );

    return user;
  }

  async recoveryPassword(data: RecoverPasswordDto): Promise<UserDocument> {
    const user = await this.getByEmail(data.email);

    if (!user) {
      throw new NotFoundException({
        message: 'El correo no se encuentra registrado',
      });
    }

    const password = Util.generateGenericPassword();
    const encryptPassword = this.generateEncryptedPass(password);

    const { name, email, lastName } = user;

    await Promise.all([
      this._emailService.sendRecoveryPassword({
        company: 'Company name',
        lastName,
        name,
        email,
        password,
      }),
      this._userModel.updateOne(
        {
          _id: user._id,
        },
        {
          password: encryptPassword,
          passwordStatus: EPasswordStatus.GENERATED,
        }
      ),
    ]);

    return user;
  }

  private getByEmail(email: string): Promise<UserDocument> {
    return this._userModel.findOne({ email }).exec();
  }

  private generateEncryptedPass(password: string): string {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }
}
