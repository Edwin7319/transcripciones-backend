import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';

import { TranscriptionFileDocument } from './transcription-file.schema';
import { TranscriptionFileService } from './transcription-file.service';

@Controller('transcripcion-archivo')
export class TranscriptionFileController {
  constructor(
    private readonly _transcriptionFileService: TranscriptionFileService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get(':audioRecordingId')
  async saveTranscriptionFiles(
    @Param('audioRecordingId') audioRecordingId: string,
  ): Promise<TranscriptionFileDocument> {
    return this._transcriptionFileService.saveTranscriptionFiles(
      audioRecordingId,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('obtener-transcripcion/:audioRecordingId')
  async getTranscription(
    @Param('audioRecordingId') audioRecordingId: string,
  ): Promise<TranscriptionFileDocument> {
    return this._transcriptionFileService.getTranscription(audioRecordingId);
  }
}
