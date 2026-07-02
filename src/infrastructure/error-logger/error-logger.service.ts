import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ErrorLogger,
  ErrorLoggerDocument,
} from 'src/infrastructure/error-logger/schemas/error-log.schema';
import { AddErrorLogDto } from './dtos/add-error-log.dto';

@Injectable()
export class ErrorLoggerService {
  constructor(
    @InjectModel(ErrorLogger.name)
    private errorLoggerModel: Model<ErrorLoggerDocument>,
  ) {}

  async addErrorLog(errorData: AddErrorLogDto) {
    const error = await this.errorLoggerModel.create(errorData);
    return error;
  }

  async getErrors() {
    return await this.errorLoggerModel.find();
  }
}
