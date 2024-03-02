import { Injectable, Logger } from '@nestjs/common';
import { SequelizeRequestLog } from '../entites/request-log.entity';
import { InjectModel } from '@nestjs/sequelize';
import { BaseRequestLoggerMiddleware } from '../../shared/middlewares/request-logger.middleware';

@Injectable()
export class SequelizeRequestLoggerMiddleware extends BaseRequestLoggerMiddleware {
    private readonly logger = new Logger('RequestMiddleware')
    constructor(@InjectModel(SequelizeRequestLog) private requestLog: typeof SequelizeRequestLog) {
        super();
    }

    async create(data: any): Promise<void> {
        try {
            await this.requestLog.create(data);
        } catch (error) {
            this.logger.error(error);
        }
    }
}