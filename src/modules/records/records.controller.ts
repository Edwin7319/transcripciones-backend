import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

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
    @Param('id') id: string
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
    @Param('fileId') fileId: string
  ): Promise<PaginationDto<RecordsDocument>> {
    return this._recordsService.getAll(fileId);
  }

  @HttpCode(HttpStatus.OK)
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )
  @Get('descargar-word/:recordId')
  async generateWordDocument(
    @Param('recordId') recordId: string,
    @Res() res: Response
  ): Promise<any> {
    const buffer = await this._recordsService.generateWordDocument(recordId);
    return res.end(buffer, 'binary');
  }
}
