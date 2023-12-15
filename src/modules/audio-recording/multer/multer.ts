import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs-extra';
import { diskStorage } from 'multer';

import * as process from 'process';

const AVAILABLE_FORMATS = ['audio'];

const FILE_SIZE = 100 * 1024 * 1024; // 100MB

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
        false,
      );
    }
  },
  limits: {
    fileSize: FILE_SIZE,
  },
  storage: diskStorage({
    destination: (req, file, cb) => {
      const [destination, destinationCopy] = [
        process.env.BUCKET_AUDIO,
        process.env.BUCKET_AUDIO_COPY,
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
