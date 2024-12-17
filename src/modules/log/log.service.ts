import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as deepDiff from 'deep-diff';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';

import { LogPaginationDto } from './dto/log-pagination.dto';
import { ELogSchema, Log, LogDocument } from './log.schema';

const KEYS_TO_OMIT = ['createdAt', 'updatedAt', '__v'];

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name)
    private readonly _logModel: Model<Log>
  ) {}

  async getBySchema(
    schemaType: ELogSchema,
    pagination: LogPaginationDto
  ): Promise<PaginationDto<LogDocument>> {
    const {
      pageIndex: skip,
      pageSize: limit,
      user: userQuery,
      code: codeQuery,
    } = pagination;

    const $andMatch = [];

    if (userQuery) {
      const userToFind = this.extractValue(userQuery);
      if (userToFind) {
        $andMatch.push({
          user: { $regex: `.*${userToFind}.*`, $options: 'i' },
        });
      }
    }

    if (codeQuery) {
      const codeToFind = this.extractValue(codeQuery);
      if (codeToFind) {
        $andMatch.push({
          schema: { $regex: `.*${codeToFind}.*`, $options: 'i' },
        });
      }
    }

    // TO-DO: colocar en los aggregate, si el filtro es "AND" y no "OR"
    /*
             $match: {
              $and: [
                { schema: schemaType },
                {
                  $or: [
                    { code: { $regex: codeToFind, $options: 'i' } },
                    { user: { $regex: userToFind, $options: 'i' } },
                  ],
                },
              ],
            },
     */
    try {
      const [response] = await this._logModel.aggregate(
        [
          {
            $match: {
              $and: [{ schema: schemaType }, ...$andMatch],
            },
          },
          {
            $facet: {
              data: [
                { $sort: { _id: -1 } },
                { $skip: skip },
                { $limit: limit },
              ],
              metadata: [
                { $count: 'total' },
                {
                  $addFields: {
                    page: skip,
                    limit: limit,
                  },
                },
              ],
            },
          },
        ],
        {
          enableUtf8Validation: false,
        }
      );

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

  private extractValue(query: string | string[]): string {
    if (Array.isArray(query)) {
      const lastCriteria = query[query.length - 1];
      return lastCriteria.split(',')[1] || '';
    }
    return query.split(',')[1] || '';
  }
}
