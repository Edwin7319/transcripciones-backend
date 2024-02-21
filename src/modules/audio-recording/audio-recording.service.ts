import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs-extra';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { PaginationDto } from '../../shared/pagination.dto';
import { Util } from '../../utils/Util';
import { EmailService } from '../email/email.service';
import { ELogAction, ELogSchema, Log } from '../log/log.schema';
import { TranscriptionFileService } from '../transcription-file/transcription-file.service';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';

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
    @InjectModel(Log.name)
    private readonly _logModel: Model<Log>,
    private readonly _configService: ConfigService,
    private readonly _transcriptionFileService: TranscriptionFileService,
    private readonly _emailService: EmailService,
    private readonly _userService: UserService
  ) {}

  async executeAudioProcess(
    data: CreateAudioRecordingDto,
    file: Express.Multer.File,
    user: Partial<UserDocument>
  ): Promise<AudioRecordingDocument> {
    let audioId = '';

    const existAudioName = await this._audioRecordingModel
      .findOne({
        name: new RegExp(`^${data.name}$`, 'i'),
      })
      .exec();

    if (existAudioName) {
      throw new ConflictException({
        message: 'Nombre de audio ya se encuentra registrado',
      });
    }

    try {
      const { newAudioFile } = await this.createAudioFileInformation(
        data,
        file,
        user
      );

      audioId = newAudioFile._id.toString();
      await this.update(
        audioId,
        {
          processStatus: EAudioRecordingStatus.PENDING,
        },
        user
      );

      const adminEmails = await this._userService.getAdminEmails();
      this._emailService.sendAdminNotification(adminEmails, user, {
        originalName: newAudioFile.originalName,
        destination: newAudioFile.destination,
        _id: newAudioFile._id,
      });

      return this._audioRecordingModel.findById(audioId);
    } catch (error) {
      await this.update(
        audioId,
        {
          processStatus: EAudioRecordingStatus.ERROR,
        },
        user
      );
      throw new InternalServerErrorException({
        message: 'Error al crear registro de audio',
      });
    }
  }

  private async createAudioFileInformation(
    data: CreateAudioRecordingDto,
    file: Express.Multer.File,
    user: Partial<UserDocument>
  ): Promise<{ originalname: string; newAudioFile: AudioRecordingDocument }> {
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
      processStatus: EAudioRecordingStatus.CREATED,
      user: new ObjectId(user._id),
      path,
      destination,
      size,
      copyName,
      destinationCopy,
      pathCopy,
    });

    await this._logModel.create({
      user: user.name,
      schema: ELogSchema.AUDIO_RECORDING,
      action: ELogAction.CREATE,
      current: newAudioFile,
      creationTime: Util.getCurrentTimestamp(),
    });

    return {
      newAudioFile,
      originalname,
    };
  }

  async getAll(
    user?: Partial<UserDocument>
  ): Promise<PaginationDto<AudioRecordingDocument>> {
    try {
      const [response] = await this._audioRecordingModel.aggregate([
        {
          $match: {
            ...(user && {
              user: new ObjectId(user._id),
            }),
          },
        },
        {
          $lookup: {
            from: 'Usuario',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
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
        message: 'Error al obtener todos los registro de audio',
      });
    }
  }

  async update(
    id: string,
    data: UpdateAudioRecordingDto,
    user: Partial<UserDocument>
  ): Promise<AudioRecordingDocument> {
    try {
      const currentRecording = await this.getById(id);

      await this._audioRecordingModel
        .updateOne({ _id: id }, { ...data })
        .exec();

      const updatedRecording = await this.getById(id);

      await this._logModel.create({
        user: user.name,
        schema: ELogSchema.AUDIO_RECORDING,
        action: ELogAction.UPDATE,
        previous: currentRecording,
        current: updatedRecording,
        creationTime: Util.getCurrentTimestamp(),
      });

      return updatedRecording;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al editar registro de audio',
      });
    }
  }

  async delete(id: string, user: Partial<UserDocument>): Promise<boolean> {
    try {
      const currentRecording = await this.getById(id);
      await this._audioRecordingModel.deleteOne({ _id: id }).exec();

      await this._logModel.create({
        user: user.name,
        schema: ELogSchema.AUDIO_RECORDING,
        action: ELogAction.DELETE,
        current: currentRecording,
        creationTime: Util.getCurrentTimestamp(),
      });
      return true;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al eliminar registro de audio',
      });
    }
  }

  async downloadTxtFile(id: string): Promise<Buffer> {
    try {
      const audioRecording = await this.getById(id);

      return this.readFileToBuffer(`./${audioRecording.path}`);
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al descargar audio',
      });
    }
  }

  async saveFileTranscription(
    audioId: string,
    user: Partial<UserDocument>,
    files: Array<Express.Multer.File>
  ): Promise<AudioRecordingDocument> {
    try {
      const fileDocument =
        await this._transcriptionFileService.saveTranscriptionFiles(
          audioId,
          files
        );

      await this.update(
        audioId,
        {
          processStatus: EAudioRecordingStatus.PROCESSED,
        },
        user
      );

      const audioRecording = await this._audioRecordingModel.findById(audioId);
      const originalUser = await this._userService.getById(
        audioRecording.user?.toString()
      );

      await Promise.all([
        this._logModel.create({
          user: user.name,
          schema: ELogSchema.TRANSCRIPTION_FILE,
          action: ELogAction.CREATE,
          current: fileDocument,
          creationTime: Util.getCurrentTimestamp(),
        }),
        this._emailService.sendUserNotification(
          {
            email: originalUser.email,
            name: originalUser.name,
            lastName: originalUser.lastName,
          },
          {
            creationTime: audioRecording.creationTime,
            originalName: audioRecording.originalName,
          }
        ),
      ]);

      return audioRecording;
    } catch (e) {
      await this.update(
        audioId,
        {
          processStatus: EAudioRecordingStatus.ERROR,
        },
        user
      );
      throw new InternalServerErrorException({
        message: 'Error al guardar transcripciones',
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
