import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import { createTransport, Transporter } from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-pool';

import { EViews } from '../../views/views';

import * as path from 'path';

interface IEjsEmail<T = any> {
  path: string;
  params: T;
}

interface IRecoveryPasswordEmail {
  company: string;
  name: string;
  lastName: string;
  password: string;
  email: string;
}

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
        user:
          'edwin.paul.73@gmail.com' || this._configService.get('email.sender'),
        pass:
          'mlew cvwj pddw uvkc' || this._configService.get('email.password'),
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
          subject: 'Recupear contraseña',
        },
        {
          path: path.join(__dirname, `../../${EViews.RECOVERY_PASSWORD}`),
          params: {
            ...data,
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
