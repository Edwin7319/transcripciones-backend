import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';
import { Util } from '../../utils/Util';

import {
  AudioRecording,
  AudioRecordingDocument,
} from './audio-recording.schema';

@Injectable()
export class AudioRecordingService {
  constructor(
    @InjectModel(AudioRecording.name)
    private readonly _audioRecordingModel: Model<AudioRecording>,
  ) {}

  create(
    data: any,
    file: Express.Multer.File,
  ): Promise<AudioRecordingDocument> {
    try {
      const { originalname, path, destination, size } = file;
      return this._audioRecordingModel.create({
        name: data.name,
        originalName: originalname,
        creationTime: Util.getCurrentTimestamp(),
        path,
        destination,
        size,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al crear registro de audio',
      });
    }
  }

  async getAll(): Promise<PaginationDto<AudioRecordingDocument>> {
    try {
      const [response] = await this._audioRecordingModel.aggregate([
        {
          $sort: { _id: -1 },
        },
        {
          $facet: {
            data: [{ $skip: (1 - 1) * 10 }, { $limit: 10 }],
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
        message: 'Error al obtener todos los registro de audio',
      });
    }
  }
}
