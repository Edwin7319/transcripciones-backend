import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './user.schema';
import { UserService } from './user.service';

@Controller('usuario')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Post('registrar')
  register(@Body() data: CreateUserDto): Promise<UserDocument> {
    return this._userService.register(data);
  }
}
