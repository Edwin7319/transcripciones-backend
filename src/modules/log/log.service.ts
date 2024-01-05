import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Log } from './log.schema';

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log.name)
    private readonly _logModel: Model<Log>,
  ) {}
}
