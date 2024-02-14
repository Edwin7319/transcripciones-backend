import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs-extra';
import { Model } from 'mongoose';

import { EStatus } from '../../shared/enum';
import { Util } from '../../utils/Util';
import { ELogAction, ELogSchema, Log } from '../log/log.schema';
import { UserDocument } from '../user/user.schema';

import { TranscriptionLocationDto } from './dto/transcription-location.dto';
import {
  TranscriptionFile,
  TranscriptionFileDocument,
} from './transcription-file.schema';

const REGEX_TEXT_TIME =
  /(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/;
@Injectable()
export class TranscriptionFileService {
  constructor(
    @InjectModel(TranscriptionFile.name)
    private readonly _transcriptionFileMode: Model<TranscriptionFile>,
    @InjectModel(Log.name)
    private readonly _logModel: Model<Log>
  ) {}

  async saveTranscriptionFiles(
    audioRecordingId: string,
    files: Array<Express.Multer.File>
  ): Promise<TranscriptionFileDocument> {
    await this._transcriptionFileMode.updateMany(
      {
        audioRecording: audioRecordingId,
      },
      {
        status: EStatus.DISABLED,
      }
    );

    const fileWithText = files.map((file) => {
      return {
        ...file,
        text: file.buffer.toString('utf8'),
        fileType: file.originalname.split('.')[1],
      };
    });

    const transcriptionFile = fileWithText.find((f) => f.fileType === 'txt');
    const transcriptionLocationFile = fileWithText.find(
      (f) => f.fileType === 'srt'
    );

    try {
      const transcription = transcriptionFile.text;
      const transcriptionLocation = transcriptionLocationFile.text;

      const transcriptionArray = this.transformTextLocationToObjects(
        transcriptionLocation
      );

      return this._transcriptionFileMode.create({
        audioRecording: audioRecordingId,
        transcriptionLocation,
        transcription,
        transcriptionArray,
        status: EStatus.ENABLED,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al leer archivos de transcripción',
      });
    }
  }

  async getTranscription(
    audioRecordingId: string
  ): Promise<TranscriptionFileDocument> {
    try {
      return this._transcriptionFileMode.findOne({
        audioRecording: audioRecordingId,
        status: EStatus.ENABLED,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener transcripción',
      });
    }
  }

  async getTranscriptionFile(
    audioRecordingId: string,
    user: Partial<UserDocument>
  ): Promise<Buffer> {
    const response = await this.getTranscription(audioRecordingId);

    this._logModel.create({
      user: user.name,
      schema: ELogSchema.AUDIO_RECORDING,
      action: ELogAction.DOWNLOAD_TXT_FILE,
      current: response,
    });
    return Buffer.from(response.transcription, 'utf-8');
  }

  async updateStatus(): Promise<any> {
    return this._transcriptionFileMode.updateMany(
      {},
      {
        status: EStatus.ENABLED,
      }
    );
  }

  private async readFile(path: string): Promise<string> {
    return fs.readFileSync(path, 'utf-8');
  }
  private transformTextLocationToObjects(
    text: string
  ): Array<TranscriptionLocationDto> {
    const lines = text.split(/\r\n\r\n/);
    const subtitleObjects: Array<TranscriptionLocationDto> = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/\r\n/);

      if (parts.length === 3) {
        const rangeMatches = parts[1].match(REGEX_TEXT_TIME);

        if (rangeMatches) {
          const range = {
            startString: rangeMatches[1],
            endString: rangeMatches[2],
            start: Util.transformStringToSeconds(rangeMatches[1]),
            end: Util.transformStringToSeconds(rangeMatches[2]),
          };

          const text = parts[2];

          subtitleObjects.push({ range, text });
        }
      }
    }

    return subtitleObjects;
  }
}
