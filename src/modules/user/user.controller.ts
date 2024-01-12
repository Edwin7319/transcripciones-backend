import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { PaginationDto } from '../../shared/pagination.dto';
import { RoleDocument } from '../role/role.schema';

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

  @HttpCode(HttpStatus.OK)
  @Get()
  getAll(): Promise<PaginationDto<UserDocument>> {
    return this._userService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get('roles')
  getAllRoles(): Promise<Array<RoleDocument>> {
    return this._userService.getAllRoles();
  }
}
