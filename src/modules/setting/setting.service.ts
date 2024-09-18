import {
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';
import { Setting, SettingDocument } from './setting.schema';


@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name)
    private readonly _settingModel: Model<Setting>
  ) {
  }

  async getAll(id?: string): Promise<PaginationDto<SettingDocument>> {
    try {
      const andQuery = [];

      andQuery.push({});
      if (id) {
        andQuery.push({
          _id: new ObjectId(id)
        });
      }

      const [response] = await this._settingModel.aggregate([
        {
          $match: {
            $and: andQuery
          }
        },
        {
          $group: {
            _id: {
              _id: '$_id',
              name: '$name',
              code: '$code',
              status: '$status',
              creationTime: '$creationTime'
            }
          }
        },
        {
          $addFields: {
            _id: '$_id._id',
            name: '$_id.name',
            code: '$_id.code',
            status: '$_id.status',
            creationTime: '$_id.creationTime'
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $facet: {
            data: [{ $skip: (1 - 1) * 10 }, { $limit: 9999 }],
            metadata: [
              { $count: 'total' },
              { $addFields: { page: 1, limit: 10 } }
            ]
          }
        }
      ]);

      return response;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener todos las configuraciones'
      });
    }
  }

  async getByCode(code: string): Promise<SettingDocument> {
    try {
      const andQuery = [];

      andQuery.push({
        code: code
      });

      const [response] = await this._settingModel.aggregate([
        {
          $match: {
            $and: andQuery
          }
        },
        {
          $group: {
            _id: {
              _id: '$_id',
              name: '$name',
              code: '$code',
              value: '$value',
              status: '$status',
              creationTime: '$creationTime'
            }
          }
        },
        {
          $addFields: {
            _id: '$_id._id',
            name: '$_id.name',
            code: '$_id.code',
            value: '$_id.value',
            status: '$_id.status',
            creationTime: '$_id.creationTime'
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $facet: {
            // Si quieres traer un solo registro, simplemente puedes usar $limit: 1
            data: [{ $limit: 1 }],
            metadata: [
              { $count: 'total' },
              { $addFields: { page: 1, limit: 10 } }
            ]
          }
        }
      ]);

      return response;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener las configuraciones'
      });
    }
  }
}
