import {
  Controller,
  Get,
  HttpCode,
  HttpStatus, Param
} from '@nestjs/common';

import { PaginationDto } from '../../shared/pagination.dto';

import { SettingService } from './setting.service';
import { SettingDocument } from './setting.schema';

@Controller('configuracion')
export class SettingController {
  constructor(private readonly _userService: SettingService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  getAll(): Promise<PaginationDto<SettingDocument>> {
    return this._userService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get('obtener-por-codigo/:code')
  getByCode(
    @Param('code') code: string
  ): Promise<SettingDocument> {
    return this._userService.getByCode(code);
  }
}
