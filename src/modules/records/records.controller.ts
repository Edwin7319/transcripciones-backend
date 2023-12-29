import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { PaginationDto } from '../../shared/pagination.dto';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { RecordsDocument } from './records.schema';
import { RecordsService } from './records.service';

@Controller('acta')
export class RecordsController {
  constructor(private readonly _recordsService: RecordsService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  create(@Body() data: CreateRecordDto): Promise<RecordsDocument> {
    return this._recordsService.create(data);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Body() data: UpdateRecordDto,
    @Param('id') id: string,
  ): Promise<RecordsDocument> {
    return this._recordsService.update(id, data);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return this._recordsService.delete(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':fileId')
  async getAll(
    @Param('fileId') fileId: string,
  ): Promise<PaginationDto<RecordsDocument>> {
    return this._recordsService.getAll(fileId);
  }
}
