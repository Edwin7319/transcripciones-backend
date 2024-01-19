import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as deepDiff from 'deep-diff';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';

import { ELogSchema, Log, LogDocument } from './log.schema';

const KEYS_TO_OMIT = ['createdAt', 'updatedAt', '__v'];

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name)
    private readonly _logModel: Model<Log>
  ) {}

  async getBySchema(
    schemaType: ELogSchema
  ): Promise<PaginationDto<LogDocument>> {
    try {
      const [response] = await this._logModel.aggregate([
        {
          $match: {
            schema: schemaType,
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

      const data = (response.data || []).map((d) => {
        if (!d.previous || !d.current) {
          return {
            ...d,
            difference: [],
          };
        }
        const withoutKeys = (deepDiff.diff(d.previous, d.current) || []).filter(
          (dif) => {
            return !KEYS_TO_OMIT.includes(dif.path[0]);
          }
        );
        return {
          ...d,
          difference: withoutKeys,
        };
      });

      return {
        ...response,
        data,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener todos los datos de auditoria',
      });
    }
  }
}
