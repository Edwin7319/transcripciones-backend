import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs-extra';
import { Model } from 'mongoose';

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
    private readonly _configService: ConfigService,
  ) {}

  async saveTranscriptionFiles(
    audioRecordingId: string,
  ): Promise<TranscriptionFileDocument> {
    const transcription = await this.getTranscription(audioRecordingId);

    if (transcription) {
      return transcription;
    }

    try {
      const transcription = await this.readFile(
        this._configService.get('file.transcriptionPath'),
      );
      const transcriptionLocation = await this.readFile(
        this._configService.get('file.transcriptionLocationPath'),
      );
      const transcriptionArray = this.transformTextLocationToObjects(
        transcriptionLocation,
      );

      return this._transcriptionFileMode.create({
        audioRecording: audioRecordingId,
        transcriptionLocation,
        transcription,
        transcriptionArray,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al leer archivos de transcripción',
      });
    }
  }

  async getTranscription(
    audioRecordingId: string,
  ): Promise<TranscriptionFileDocument> {
    try {
      return this._transcriptionFileMode
        .findOne({
          audioRecording: audioRecordingId,
        })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al obtener transcripción',
      });
    }
  }

  private async readFile(path: string): Promise<string> {
    return fs.readFileSync(path, 'utf-8');
  }
  private transformTextLocationToObjects(
    text: string,
  ): Array<TranscriptionLocationDto> {
    const lines = text.split(/\r\n\r\n/);
    const subtitleObjects: Array<TranscriptionLocationDto> = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(/\r\n/);

      if (parts.length === 3) {
        const rangeMatches = parts[1].match(REGEX_TEXT_TIME);

        if (rangeMatches) {
          const range = {
            init: rangeMatches[1],
            end: rangeMatches[2],
          };

          const text = parts[2];

          subtitleObjects.push({ range, text });
        }
      }
    }

    return subtitleObjects;
  }
}