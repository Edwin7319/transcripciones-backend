import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as htmlToDocx from 'html-to-docx';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';
import { Util } from '../../utils/Util';
import { ELogAction, ELogSchema, Log } from '../log/log.schema';

import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { Records, RecordsDocument } from './records.schema';

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel(Records.name)
    private readonly _recordsSchema: Model<Records>,
    @InjectModel(Log.name)
    private readonly _logModel: Model<Log>
  ) {}

  async create(data: CreateRecordDto): Promise<RecordsDocument> {
    try {
      const response = await this._recordsSchema.create({
        text: data.text,
        name: data.name,
        transcriptionFile: new ObjectId(data.fileId),
        creationTime: Util.getCurrentTimestamp(),
      });

      this._logModel.create({
        user: 'Edwin',
        schema: ELogSchema.RECORDS,
        action: ELogAction.CREATE,
        current: response,
      });

      return response;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al crear nueva acta',
      });
    }
  }

  async update(id: string, data: UpdateRecordDto): Promise<RecordsDocument> {
    try {
      const currentRecord = await this.getById(id);
      await this._recordsSchema.updateOne({ _id: id }, { ...data }).exec();
      const updatedRecord = await this.getById(id);

      this._logModel.create({
        user: 'Edwin',
        schema: ELogSchema.RECORDS,
        action: ELogAction.UPDATE,
        current: updatedRecord,
        previous: currentRecord,
      });

      return updatedRecord;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al editar nueva acta',
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const currentRecord = await this.getById(id);
      await this._recordsSchema.deleteOne({ _id: id }).exec();

      this._logModel.create({
        user: 'Edwin',
        schema: ELogSchema.RECORDS,
        action: ELogAction.DELETE,
        current: currentRecord,
      });
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al eliminar acta',
      });
    }
  }

  async getAll(fileId: string): Promise<PaginationDto<RecordsDocument>> {
    try {
      const [response] = await this._recordsSchema.aggregate([
        {
          $match: {
            transcriptionFile: new ObjectId(fileId),
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $facet: {
            data: [{ $skip: (1 - 1) * 10 }, { $limit: 9999 }],
            metadata: [
              { $count: 'total' },
              { $addFields: { page: 1, limit: 10 } },
            ],
          },
        },
      ]);

      return response;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener todos los registro de actas',
      });
    }
  }

  async generateWordDocument(recordId: string): Promise<Buffer> {
    try {
      const record = await this.getById(recordId);

      this._logModel.create({
        user: 'Edwin',
        schema: ELogSchema.RECORDS,
        action: ELogAction.DOWNLOAD_DOCX_FILE,
        current: record,
      });

      return htmlToDocx(record.text);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al generar documento de word',
      });
    }
  }

  private async getById(id: string): Promise<RecordsDocument> {
    return this._recordsSchema.findById(id).exec();
  }
}
