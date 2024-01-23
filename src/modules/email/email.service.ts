import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import { createTransport, Transporter } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-pool';

import { Util } from '../../utils/Util';
import { EViews } from '../../views/views';
import { AudioRecordingDocument } from '../audio-recording/audio-recording.schema';
import { UserDocument } from '../user/user.schema';

import * as path from 'path';

interface IEjsEmail<T = any> {
  path: string;
  params: T;
}

interface IBaseEmail {
  name: string;
  lastName: string;
  password: string;
  email: string;
}

type IRecoveryPasswordEmail = IBaseEmail;

type IRegisterUser = IBaseEmail;

@Injectable()
export class EmailService implements OnModuleInit {
  private _transporter: Transporter;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _logger: Logger
  ) {}

  onModuleInit(): void {
    this.establecerAuth2ClientGoogle();
  }

  private establecerAuth2ClientGoogle() {
    this.generarTransporterNodemailer()
      .then((r) => {
        this._transporter = r;
        this._logger.log('Conexión email exitosa');
      })
      .catch((error) => {
        this._logger.error({
          message: 'Error inicializando conexión a email',
          error: JSON.stringify(error),
        });
      });
  }

  private async generarTransporterNodemailer(): Promise<Transporter> {
    return createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: this._configService.get('email.sender'),
        pass: this._configService.get('email.password'),
      },
      tls: {
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_method',
        ciphers: 'SSLv3',
      },
    });
  }

  async sendRecoveryPassword(data: IRecoveryPasswordEmail): Promise<boolean> {
    try {
      return this.sendEmailWithTemplate(
        {
          to: [data.email],
          subject: 'Recuperar contraseña',
        },
        {
          path: path.join(__dirname, `../../${EViews.RECOVERY_PASSWORD}`),
          params: {
            ...data,
            company: this._configService.get('email.companyName'),
            supportEmail: this._configService.get('email.support'),
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async sendRegisterUser(data: IRegisterUser): Promise<boolean> {
    try {
      return this.sendEmailWithTemplate(
        {
          to: [data.email],
          subject: 'Registro de usuario',
        },
        {
          path: path.join(__dirname, `../../${EViews.REGISTER_USER}`),
          params: {
            ...data,
            company: this._configService.get('email.companyName'),
            supportEmail: this._configService.get('email.support'),
            appUrl: this._configService.get('email.appUrl'),
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async sendAdminNotification(
    adminEmails: Array<string>,
    user: Partial<UserDocument>,
    audioRecording: Partial<AudioRecordingDocument>
  ): Promise<boolean> {
    try {
      return this.sendEmailWithTemplate(
        {
          to: adminEmails,
          subject: 'Notificación carga de audio',
        },
        {
          path: path.join(__dirname, `../../${EViews.ADMIN_NOTIFICATION}`),
          params: {
            ...audioRecording,
            userEmail: user.email,
            company: this._configService.get('email.companyName'),
            supportEmail: this._configService.get('email.support'),
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async sendUserNotification(
    user: Partial<UserDocument>,
    audioRecording: Partial<AudioRecordingDocument>
  ): Promise<boolean> {
    try {
      return this.sendEmailWithTemplate(
        {
          to: [user.email],
          subject: 'Notificación transcripciones cargadas',
        },
        {
          path: path.join(__dirname, `../../${EViews.USER_NOTIFICATION}`),
          params: {
            ...user,
            ...audioRecording,
            audioDate: Util.timestampToDateString(audioRecording.creationTime),
            company: this._configService.get('email.companyName'),
            supportEmail: this._configService.get('email.support'),
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  private async sendEmailWithTemplate(
    body: Omit<MailOptions, 'sender'>,
    options: IEjsEmail
  ): Promise<any> {
    return this.sendEmail({
      ...body,
      html: await ejs.renderFile(options.path, options.params),
    });
  }

  private async sendEmail(body: Omit<MailOptions, 'sender'>): Promise<any> {
    return new Promise((resolve, reject) => {
      this._transporter.sendMail(body, (err, info) => {
        err ? reject(err) : resolve(info);
        this._transporter.close();
      });
    });
  }
}
