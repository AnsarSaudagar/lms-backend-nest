import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ErrorLogger,
  ErrorLoggerDocument,
} from 'src/schemas/errorLogger.schema';
import { AddErrorLogDto } from './dtos/add-error-log.dto';

@Injectable()
export class ErrorLoggerService {
  constructor(
    @InjectModel(ErrorLogger.name)
    private errorLoggerModel: Model<ErrorLoggerDocument>,
  ) {}

  async addErrorLog(errorData: AddErrorLogDto){
    return await this.errorLoggerModel.create(errorData);
  }
}
