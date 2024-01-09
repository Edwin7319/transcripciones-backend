import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';

import { PaginationDto } from '../../shared/pagination.dto';

import { ELogSchema, LogDocument } from './log.schema';
import { LogService } from './log.service';

@Controller('log')
export class LogController {
  constructor(private readonly _logService: LogService) {}

  @HttpCode(HttpStatus.OK)
  @Get(':schemaType')
  getBySchema(
    @Param('schemaType') schemaType: ELogSchema
  ): Promise<PaginationDto<LogDocument>> {
    return this._logService.getBySchema(schemaType);
  }
}
