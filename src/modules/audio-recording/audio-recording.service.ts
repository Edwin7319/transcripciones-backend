import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs-extra';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';
import { Util } from '../../utils/Util';

import {
  AudioRecording,
  AudioRecordingDocument,
} from './audio-recording.schema';
import { CreateAudioRecordingDto } from './dto/create-audio-recording.dto';

@Injectable()
export class AudioRecordingService {
  constructor(
    @InjectModel(AudioRecording.name)
    private readonly _audioRecordingModel: Model<AudioRecording>,
    private readonly _configService: ConfigService,
  ) {}

  async create(
    data: CreateAudioRecordingDto,
    file: Express.Multer.File,
  ): Promise<AudioRecordingDocument> {
    try {
      const { originalname, path, destination, size } = file;
      const uploadFilePath = path;

      const fileBuffer = fs.readFileSync(uploadFilePath);

      const copyName = `${Util.getCurrentTimestamp()}_${originalname}`;
      const destinationCopy = `${this._configService.get('bucket.audioCopy')}`;
      const pathCopy = `${destinationCopy}/${copyName}`;
      fs.writeFileSync(pathCopy, fileBuffer);

      return this._audioRecordingModel.create({
        name: data.name,
        originalName: originalname,
        creationTime: Util.getCurrentTimestamp(),
        path,
        destination,
        size,
        copyName,
        destinationCopy,
        pathCopy,
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

  async edit(
    id: string,
    data: CreateAudioRecordingDto,
  ): Promise<AudioRecordingDocument> {
    try {
      await this._audioRecordingModel
        .updateOne({ _id: id }, { ...data })
        .exec();

      return this.getById(id);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al editar registro de audio',
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const audioRecording = await this.getById(id);
      console.log(audioRecording);
      await this._audioRecordingModel.deleteOne({ _id: id }).exec();

      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al editar registro de audio',
      });
    }
  }

  async getById(id: string): Promise<AudioRecordingDocument> {
    return this._audioRecordingModel.findById(id).exec();
  }
}
