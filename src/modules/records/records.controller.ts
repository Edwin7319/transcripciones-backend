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
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

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
  create(
    @Body() data: CreateRecordDto,
    @Req() req: Request
  ): Promise<RecordsDocument> {
    return this._recordsService.create(data, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  update(
    @Body() data: UpdateRecordDto,
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<RecordsDocument> {
    return this._recordsService.update(id, data, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request): Promise<boolean> {
    return this._recordsService.delete(id, req.user);
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
    @Res() res: Response,
    @Req() req: Request
  ): Promise<any> {
    const buffer = await this._recordsService.generateWordDocument(
      recordId,
      req.user
    );
    return res.end(buffer, 'binary');
  }
}
