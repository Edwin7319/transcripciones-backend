import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LogController } from './log.controller';
import { Log, LogSchema } from './log.schema';
import { LogService } from './log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
  ],
  providers: [LogService],
  controllers: [LogController],
  exports: [LogService],
})
export class LogModule {}
