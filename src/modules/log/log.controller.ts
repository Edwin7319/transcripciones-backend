import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';

import { PaginationDto } from '../../shared/pagination.dto';

import { LogPaginationDto } from './dto/log-pagination.dto';
import { ELogSchema, LogDocument } from './log.schema';
import { LogService } from './log.service';

@Controller('log')
export class LogController {
  constructor(private readonly _logService: LogService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':schemaType')
  getBySchema(
    @Param('schemaType') schemaType: ELogSchema,
    @Query() paginationDto: LogPaginationDto
  ): Promise<PaginationDto<LogDocument>> {
    return this._logService.getBySchema(schemaType, paginationDto);
  }
}
