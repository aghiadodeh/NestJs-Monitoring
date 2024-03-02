import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';
import { Model } from 'mongoose';
import { RequestLog } from '../entites/request-log.entity';
import { BaseRequestLoggerMiddleware } from '../../shared/middlewares/request-logger.middleware';

@Injectable()
export class MongooseRequestLoggerMiddleware extends BaseRequestLoggerMiddleware {
    constructor(@InjectModel(RequestLog.name) private requestLog: Model<RequestLog>) { 
        super()
    }

    async create(data: any): Promise<void> {
        await this.requestLog.create(data);
    }
}