import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs-extra';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';
import { Util } from '../../utils/Util';
import { CommandService } from '../commands/command.service';
import { TranscriptionFileService } from '../transcription-file/transcription-file.service';

import {
  AudioRecording,
  AudioRecordingDocument,
  EAudioRecordingStatus,
} from './audio-recording.schema';
import { CreateAudioRecordingDto } from './dto/create-audio-recording.dto';
import { UpdateAudioRecordingDto } from './dto/update-audio-recording.dto';

import * as nodePath from 'path';

@Injectable()
export class AudioRecordingService {
  constructor(
    @InjectModel(AudioRecording.name)
    private readonly _audioRecordingModel: Model<AudioRecording>,
    private readonly _configService: ConfigService,
    private readonly _transcriptionFileService: TranscriptionFileService,
    private readonly _commandService: CommandService,
  ) {}

  async create(
    data: CreateAudioRecordingDto,
    file: Express.Multer.File,
  ): Promise<AudioRecordingDocument> {
    try {
      const { originalname, path, destination, size } = file;

      const fileBuffer = fs.readFileSync(path);

      const copyName = `${Util.getCurrentTimestamp()}_${originalname}`;
      const destinationCopy = this._configService.get('bucket.audioCopy');
      const pathCopy = nodePath.join(destinationCopy, copyName);
      fs.writeFileSync(pathCopy, fileBuffer);

      const newAudioFile = await this._audioRecordingModel.create({
        name: data.name,
        originalName: originalname,
        creationTime: Util.getCurrentTimestamp(),
        duration: parseFloat(data.duration),
        status: EAudioRecordingStatus.CREATED,
        path,
        destination,
        size,
        copyName,
        destinationCopy,
        pathCopy,
      });

      const fileName = originalname.split('.')[0];

      const commandResponse = await this._commandService.executeCommand(
        originalname,
        fileName,
      );
      console.log({ commandResponse });

      await this.edit(newAudioFile._id.toString(), {
        status: EAudioRecordingStatus.EXECUTED_COMMAND,
      });

      await this._transcriptionFileService.saveTranscriptionFiles(
        newAudioFile._id.toString(),
        fileName,
      );

      await this.edit(newAudioFile._id.toString(), {
        status: EAudioRecordingStatus.COMPLETED,
      });

      return newAudioFile;
    } catch (error) {
      console.log(error);
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
    data: UpdateAudioRecordingDto,
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

  async getAudio(id: string): Promise<Buffer> {
    try {
      const audioRecording = await this.getById(id);

      return this.readFileToBuffer(`./${audioRecording.path}`);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al descargar audio',
      });
    }
  }

  async getById(id: string): Promise<AudioRecordingDocument> {
    return this._audioRecordingModel.findById(id).exec();
  }

  private readFileToBuffer(filePath: string): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
