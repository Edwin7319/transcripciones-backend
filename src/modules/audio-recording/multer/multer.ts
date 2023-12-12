import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs-extra';
import { diskStorage } from 'multer';

const AVAILABLE_FORMATS = ['audio'];

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
    fileSize: 100 * 1024 * 1024,
    fieldNameSize: 100 * 1024 * 1024,
  },
  storage: diskStorage({
    destination: (req, file, cb) => {
      const path = `./public/audio`;
      fs.mkdirsSync(path);
      cb(null, path);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
};
