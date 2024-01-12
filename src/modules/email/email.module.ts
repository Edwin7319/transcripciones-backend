import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EmailService } from './email.service';

@Module({
  providers: [EmailService, ConfigService, Logger],
  exports: [EmailService],
})
export class EmailModule {}
