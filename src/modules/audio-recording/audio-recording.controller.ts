import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PaginationDto } from '../../shared/pagination.dto';

import { AudioRecordingDocument } from './audio-recording.schema';
import { AudioRecordingService } from './audio-recording.service';
import { AUDIO_MULTER } from './multer/multer';

@Controller('audio-recording')
export class AudioRecordingController {
  constructor(private readonly _audioRecordingService: AudioRecordingService) {}

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('audio', {
      ...AUDIO_MULTER,
    }),
  )
  @Post()
  async create(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AudioRecordingDocument> {
    return this._audioRecordingService.create({ name: 'archivo 1' }, file);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAll(): Promise<PaginationDto<AudioRecordingDocument>> {
    return this._audioRecordingService.getAll();
  }
}
