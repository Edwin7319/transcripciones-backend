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

import { EStatus } from '../../shared/enum';
import { PaginationDto } from '../../shared/pagination.dto';
import { Util } from '../../utils/Util';
import { SignInUserDto } from '../auth/dto/sign-in-user.dto';
import {
  RecoverPasswordDto,
  UpdatePasswordDto,
} from '../auth/dto/update-password.dto';
import { EmailService } from '../email/email.service';
import { Role, RoleDocument } from '../role/role.schema';

import { CreateUserDto } from './dto/create-user.dto';
import { EPasswordStatus, User, UserDocument } from './user.schema';
import { Setting, SettingDocument } from '../setting/setting.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly _userModel: Model<User>,
    @InjectModel(Role.name)
    private readonly _roleModel: Model<Role>,
    @InjectModel(Setting.name)
    private readonly _settingModel: Model<Setting>,
    private readonly _emailService: EmailService
  ) {}

  async register(data: CreateUserDto): Promise<any> {
    const user = await this.getByEmail(data.email);

    const users = await this.getAll();
    const totalRecords = users.metadata[0].total;

    const settings = await this.getByCode('001');
    const maxValueUsers = settings?.data?.length ? +settings.data[0].value : 0;
    if (totalRecords >= maxValueUsers) {
      throw new ConflictException({
        message: 'Ha excedido la cantidad máxima de usuarios a registrar',
      });
    }

    if (user) {
      throw new ConflictException({
        message: 'El correo ya se encuentra registrado',
      });
    }

    try {
      const password = Util.generateGenericPassword();
      const encryptPassword = this.generateEncryptedPass(password);

      const user = await this._userModel.create({
        ...data,
        password: encryptPassword,
        passwordStatus: EPasswordStatus.GENERATED,
        roles: data.roles.map((r) => new ObjectId(r)),
      });

      await this._emailService.sendRegisterUser({
        email: user.email,
        lastName: user.lastName,
        name: user.name,
        password,
      });

      return user;
    } catch (e) {
      throw new InternalServerErrorException({
        message: 'Error al registrar usuario',
      });
    }
  }

  async login(data: SignInUserDto): Promise<UserDocument> {
    const user = await this.getActiveUserByEmail(data.email);

    if (!user) {
      throw new NotFoundException({
        message: 'No se encontró al usuario',
      });
    }

    if (user.status === EStatus.DISABLED) {
      throw new NotFoundException({
        message:
          'El usuario se encuentra deshabilitado, por favor comuníquese con un admistrador',
      });
    }

    const matchCode = await compare(data.password, user.password);

    if (!matchCode) {
      throw new NotFoundException({
        message: 'Credenciales no validas',
      });
    }

    const userPopulated = await this.getAll(user._id.toString());
    return userPopulated.data[0];
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

    if (user.status === EStatus.DISABLED) {
      throw new NotFoundException({
        message:
          'El usuario se encuentra deshabilitado, por favor comuníquese con un admistrador',
      });
    }

    const password = Util.generateGenericPassword();
    const encryptPassword = this.generateEncryptedPass(password);

    const { name, email, lastName } = user;

    await Promise.all([
      this._emailService.sendRecoveryPassword({
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

  async getAll(id?: string): Promise<PaginationDto<UserDocument>> {
    try {
      const andQuery = [];

      andQuery.push({});
      if (id) {
        andQuery.push({
          _id: new ObjectId(id),
        });
      }

      const [response] = await this._userModel.aggregate([
        {
          $match: {
            $and: andQuery,
          },
        },
        {
          $lookup: {
            from: 'Rol',
            localField: 'roles',
            foreignField: '_id',
            as: 'roles',
          },
        },
        {
          $unwind: {
            path: '$roles',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: {
              _id: '$_id',
              name: '$name',
              lastName: '$lastName',
              email: '$email',
              status: '$status',
              password: '$password',
              passwordStatus: '$passwordStatus',
              creationTime: '$creationTime',
              institution: '$institution',
            },
            roles: {
              $push: '$roles',
            },
          },
        },
        {
          $addFields: {
            _id: '$_id._id',
            name: '$_id.name',
            lastName: '$_id.lastName',
            email: '$_id.email',
            status: '$_id.status',
            password: '$_id.password',
            passwordStatus: '$_id.passwordStatus',
            creationTime: '$_id.creationTime',
            institution: '$_id.institution',
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $facet: {
            data: [{ $skip: (1 - 1) * 10 }, { $limit: 9999 }],
            metadata: [
              { $count: 'total' },
              { $addFields: { page: 1, limit: 10 } },
            ],
          },
        },
      ]);

      return response;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener todos los usuarios',
      });
    }
  }

  async getAllRoles(): Promise<Array<RoleDocument>> {
    try {
      return this._roleModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener todos los roles',
      });
    }
  }

  async updateStatus(id: string, status: string): Promise<UserDocument> {
    try {
      await this._userModel.updateOne(
        { _id: new ObjectId(id) },
        {
          status,
        }
      );
      const response = await this.getAll(id);
      return response.data[0];
    } catch (e) {
      throw new InternalServerErrorException({
        message: 'Error al actualizar estado de usuario',
      });
    }
  }

  private getByEmail(email: string): Promise<UserDocument> {
    return this._userModel.findOne({ email }).exec();
  }

  getById(id: string): Promise<UserDocument> {
    return this._userModel.findOne({ _id: new ObjectId(id) }).exec();
  }
  private getActiveUserByEmail(email: string): Promise<UserDocument> {
    return this._userModel.findOne({ email, status: EStatus.ENABLED }).exec();
  }

  private generateEncryptedPass(password: string): string {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
  }

  async getAdminEmails(): Promise<Array<string>> {
    const response = await this._userModel.aggregate([
      {
        $lookup: {
          from: 'Rol',
          localField: 'roles',
          foreignField: '_id',
          as: 'roles',
        },
      },
      {
        $unwind: {
          path: '$roles',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          'roles.name': {
            $regex: /^Administrador$/i,
          },
        },
      },
      {
        $group: {
          _id: {
            _id: '$_id',
            email: '$email',
          },
          roles: {
            $push: '$roles',
          },
        },
      },
      {
        $addFields: {
          _id: '$_id._id',
          email: '$_id.email',
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);
    return (response || []).map((r: UserDocument) => r.email);
  }

  async update(id: string, data: CreateUserDto): Promise<boolean> {
    try {
      await this._userModel.updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          ...data,
          roles: data.roles.map((r) => new ObjectId(r)),
        }
      );
      return true;
    } catch (e) {
      throw new InternalServerErrorException({
        message: 'Error al actualizar información de usuario',
      });
    }
  }

  async getByCode(code: string): Promise<PaginationDto<SettingDocument>> {
    try {
      const andQuery = [];

      andQuery.push({
        code: code
      });

      const [response] = await this._settingModel.aggregate([
        {
          $match: {
            $and: andQuery
          }
        },
        {
          $group: {
            _id: {
              _id: '$_id',
              name: '$name',
              code: '$code',
              value: '$value',
              status: '$status',
              creationTime: '$creationTime'
            }
          }
        },
        {
          $addFields: {
            _id: '$_id._id',
            name: '$_id.name',
            code: '$_id.code',
            value: '$_id.value',
            status: '$_id.status',
            creationTime: '$_id.creationTime'
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $facet: {
            data: [{ $limit: 1 }],
            metadata: [
              { $count: 'total' },
              { $addFields: { page: 1, limit: 10 } }
            ]
          }
        }
      ]);

      return response;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener las configuraciones'
      });
    }
  }

}
