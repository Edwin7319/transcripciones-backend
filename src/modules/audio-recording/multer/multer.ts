import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs-extra';
import { diskStorage, memoryStorage } from 'multer';

import * as process from 'process';

const AVAILABLE_FORMATS = ['audio'];

const AUDIO_FILE_SIZE = 99999 * 1024 * 1024; // 99999MB
const TRANSCRIPTION_FILE_SIZE = 500 * 1024 * 1024; // 999999MB

export const AUDIO_MULTER: MulterOptions = {
  fileFilter: (req, file, cb) => {
    const incomingDocumentType = file.mimetype;
    const isValid: boolean = AVAILABLE_FORMATS.some((documentType) => {
      return incomingDocumentType.includes(documentType);
    });
    if (isValid) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException({
          mensaje: 'No se ha enviado un formato de audio adecuado',
        }),
        false
      );
    }
  },
  limits: {
    fileSize: AUDIO_FILE_SIZE,
  },
  storage: diskStorage({
    destination: (req, file, cb) => {
      const [destination, destinationCopy] = [
        process.env.PATH_BUCKET_AUDIO,
        process.env.PATH_BUCKET_AUDIO_COPY,
      ];
      fs.mkdirsSync(destination);
      fs.mkdirsSync(destinationCopy);
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
};

export const TRANSCRIPTION_MULTER: MulterOptions = {
  limits: {
    fileSize: TRANSCRIPTION_FILE_SIZE,
  },
  storage: memoryStorage(),
};
