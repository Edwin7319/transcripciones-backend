import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';

import { SignInUserDto } from './dto/sign-in-user.dto';
import {
  RecoverPasswordDto,
  UpdatePasswordDto,
} from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly _jwtService: JwtService,
    private readonly _userService: UserService
  ) {}

  async login(data: SignInUserDto): Promise<any> {
    const userInfo = await this._userService.login(data);

    const token = await this.generateToken(userInfo);
    return {
      passwordStatus: userInfo.passwordStatus,
      token,
    };
  }

  async updatePassword(data: UpdatePasswordDto): Promise<boolean> {
    await this._userService.updatePassword(data);
    return true;
  }

  async recoveryPassword(data: RecoverPasswordDto): Promise<boolean> {
    await this._userService.recoveryPassword(data);
    return true;
  }

  private async generateToken(user: UserDocument): Promise<string> {
    return this._jwtService.signAsync({
      name: user.name,
      email: user.email,
      roles: user.roles,
    });
  }
}
