import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';

import { TranscriptionFileDocument } from './transcription-file.schema';
import { TranscriptionFileService } from './transcription-file.service';

@Controller('transcripcion-archivo')
export class TranscriptionFileController {
  constructor(
    private readonly _transcriptionFileService: TranscriptionFileService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get(':audioRecordingId')
  async saveTranscriptionFiles(
    @Param('audioRecordingId') audioRecordingId: string
  ): Promise<TranscriptionFileDocument> {
    return this._transcriptionFileService.saveTranscriptionFiles(
      audioRecordingId
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('obtener-transcripcion/:audioRecordingId')
  async getTranscription(
    @Param('audioRecordingId') audioRecordingId: string
  ): Promise<TranscriptionFileDocument> {
    return this._transcriptionFileService.getTranscription(audioRecordingId);
  }

  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Get('descargar-transcripcion/:audioRecordingId')
  async getTranscriptionFile(
    @Param('audioRecordingId') audioRecordingId: string,
    @Res() res
  ): Promise<TranscriptionFileDocument> {
    const buffer = await this._transcriptionFileService.getTranscriptionFile(
      audioRecordingId
    );
    return res.type('txt').end(buffer, 'binary');
  }
}
