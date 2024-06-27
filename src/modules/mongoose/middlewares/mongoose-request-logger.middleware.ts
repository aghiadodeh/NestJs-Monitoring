import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RequestLog } from "../entities/request-log.entity";
import { BaseRequestLoggerMiddleware } from "../../shared/middlewares/request-logger.middleware";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import {
  MONITORING_INSERT_REQUEST_LOG,
  MONITORING_MONGO_CONNECTION,
  MONITORING_QUEUE,
} from "../../shared/config/config";

@Injectable()
export class MongooseRequestLoggerMiddleware extends BaseRequestLoggerMiddleware {
  constructor(
    @InjectModel(RequestLog.name, MONITORING_MONGO_CONNECTION)
    private requestLog: Model<RequestLog>,
    @InjectQueue(MONITORING_QUEUE)
    private queue: Queue,
  ) {
    super();
  }

  async create(data: any): Promise<void> {
    if (process.env.MONITORING_REDIS_HOST && process.env.MONITORING_REDIS_PORT) {
      await this.queue.add(MONITORING_INSERT_REQUEST_LOG, data);
    } else {
      await this.requestLog.create(data);
    }
  }
}
