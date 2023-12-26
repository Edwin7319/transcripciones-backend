import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { PaginationDto } from '../../shared/pagination.dto';

import { AudioRecordingDocument } from './audio-recording.schema';
import { AudioRecordingService } from './audio-recording.service';
import { CreateAudioRecordingDto } from './dto/create-audio-recording.dto';
import { UpdateAudioRecordingDto } from './dto/update-audio-recording.dto';
import { AUDIO_MULTER } from './multer/multer';

@Controller('registro-de-audio')
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
    @Body() data: CreateAudioRecordingDto,
  ): Promise<AudioRecordingDocument> {
    return this._audioRecordingService.create(data, file);
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async edit(
    @Body() data: UpdateAudioRecordingDto,
    @Param('id') id: string,
  ): Promise<AudioRecordingDocument> {
    return this._audioRecordingService.edit(id, data);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAll(): Promise<PaginationDto<AudioRecordingDocument>> {
    return this._audioRecordingService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<boolean> {
    return this._audioRecordingService.delete(id);
  }

  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Get('obtener-audio/:id')
  async getAudio(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const buffer = await this._audioRecordingService.getAudio(id);
    res.send(buffer);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':filename')
  serveAudioFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): void {
    res.sendFile(filename, { root: 'public/audio-copy' });
  }
}
