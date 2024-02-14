import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { TranscriptionFileDocument } from './transcription-file.schema';
import { TranscriptionFileService } from './transcription-file.service';

@Controller('transcripcion-archivo')
export class TranscriptionFileController {
  constructor(
    private readonly _transcriptionFileService: TranscriptionFileService
  ) {}

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
    @Res() res: Response,
    @Req() req: Request
  ) {
    const buffer = await this._transcriptionFileService.getTranscriptionFile(
      audioRecordingId,
      req.user
    );
    return res.type('txt').end(buffer, 'binary');
  }

  @HttpCode(HttpStatus.OK)
  @Get('actualizar-estado')
  async updateStatus(): Promise<{ message: string; response: any }> {
    const response = await this._transcriptionFileService.updateStatus();
    return {
      message: 'Ok',
      response,
    };
  }
}
