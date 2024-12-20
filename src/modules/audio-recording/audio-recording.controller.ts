import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';

import { PaginationDto } from '../../shared/pagination.dto';

import { AudioRecordingDocument } from './audio-recording.schema';
import { AudioRecordingService } from './audio-recording.service';
import { CreateAudioRecordingDto } from './dto/create-audio-recording.dto';
import { UpdateAudioRecordingDto } from './dto/update-audio-recording.dto';
import { AUDIO_MULTER, TRANSCRIPTION_MULTER } from './multer/multer';

@Controller('registro-de-audio')
export class AudioRecordingController {
  constructor(private readonly _audioRecordingService: AudioRecordingService) {}

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('audio', {
      ...AUDIO_MULTER,
    })
  )
  @Post('cargar-audio')
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: CreateAudioRecordingDto,
    @Req() req: Request
  ): Promise<AudioRecordingDocument> {
    return this._audioRecordingService.executeAudioProcess(
      data,
      file,
      req.user
    );
  }

  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async edit(
    @Body() data: UpdateAudioRecordingDto,
    @Param('id') id: string,
    @Req() req: Request
  ): Promise<AudioRecordingDocument> {
    return this._audioRecordingService.update(id, data, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('por-usuario')
  async getAllByUser(
    @Req() req: Request
  ): Promise<PaginationDto<AudioRecordingDocument>> {
    return this._audioRecordingService.getAll(req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('todos')
  async getAllByAdmin(): Promise<PaginationDto<AudioRecordingDocument>> {
    return this._audioRecordingService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request): Promise<boolean> {
    return this._audioRecordingService.delete(id, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'application/octet-stream')
  @Get('obtener-audio/:id')
  async getAudio(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const buffer = await this._audioRecordingService.downloadTxtFile(id);
    res.send(buffer);
  }

  @HttpCode(HttpStatus.OK)
  @Get('reproducir/:filename')
  serveAudioFile(
    @Param('filename') filename: string,
    @Res() res: Response
  ): void {
    res.sendFile(filename, { root: 'public/audio-copy' });
  }

  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor('transcription', 2, {
      ...TRANSCRIPTION_MULTER,
    })
  )
  @Patch('guardar-transcripcion')
  saveFileTranscription(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body('audioId') audioId: string,
    @Req() req: Request
  ): Promise<AudioRecordingDocument> {
    return this._audioRecordingService.saveFileTranscription(
      audioId,
      req.user,
      files
    );
  }
}
