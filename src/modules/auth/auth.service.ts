import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SignInUserDto } from './dto/sign-in-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly _jwtService: JwtService) {}

  async login(data: SignInUserDto): Promise<any> {
    const userInfo = data;

    if (!userInfo) {
      throw new NotFoundException({
        message:
          'Usuario no encontrado, por favor revise que el usuario este habilitado',
      });
    }

    const token = await this.generateToken(userInfo);
    return {
      ...userInfo,
      token,
    };
  }

  async generateToken(user: any): Promise<string> {
    return this._jwtService.signAsync({
      email: user.email,
      roles: user.roles,
    });
  }
}
