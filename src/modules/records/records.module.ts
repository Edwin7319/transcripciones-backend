import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Log, LogSchema } from '../log/log.schema';

import { RecordsController } from './records.controller';
import { Records, RecordsSchema } from './records.schema';
import { RecordsService } from './records.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Records.name,
        schema: RecordsSchema,
      },
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}
