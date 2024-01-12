import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/sign-in-user.dto';
import {
  RecoverPasswordDto,
  UpdatePasswordDto,
} from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  loginUser(@Body() data: SignInUserDto): Promise<any> {
    return this._authService.login(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('update-password')
  updatePassword(@Body() data: UpdatePasswordDto): Promise<boolean> {
    return this._authService.updatePassword(data);
  }

  @HttpCode(HttpStatus.OK)
  @Post('recovery-password')
  recoveryPassword(@Body() data: RecoverPasswordDto): Promise<boolean> {
    return this._authService.recoveryPassword(data);
  }
}
