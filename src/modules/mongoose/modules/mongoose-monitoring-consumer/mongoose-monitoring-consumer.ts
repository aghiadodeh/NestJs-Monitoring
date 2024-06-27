import { OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { InjectModel } from "@nestjs/mongoose";
import { Job } from "bull";
import { Model } from "mongoose";
import { RequestLog } from "../../entities/request-log.entity";
import { MongooseLog } from "../../entities/mongoose-log.entity";
import {
  MONITORING_MONGO_CONNECTION,
  MONITORING_INSERT_DB_LOG,
  MONITORING_INSERT_REQUEST_LOG,
  MONITORING_QUEUE,
} from "../../../shared/config/config";
import { Logger } from "@nestjs/common";

@Processor(MONITORING_QUEUE)
export class MongooseMonitoringConsumer {
  private logger = new Logger(MongooseMonitoringConsumer.name);

  constructor(
    @InjectModel(RequestLog.name, MONITORING_MONGO_CONNECTION)
    private requestLog: Model<RequestLog>,
    @InjectModel(MongooseLog.name, MONITORING_MONGO_CONNECTION)
    private mongooseLog: Model<MongooseLog>,
  ) {}

  @Process({ name: MONITORING_INSERT_REQUEST_LOG, concurrency: 1 })
  async insertRequestLog(job: Job<any>) {
    await this.requestLog.create(job.data);
  }

  @Process({ name: MONITORING_INSERT_DB_LOG, concurrency: 1 })
  async insertDbLog(job: Job<any>) {
    await this.mongooseLog.create(job.data);
  }

  @OnQueueFailed()
  handleError(job: Job<any>, error: any) {
    this.logger.error(`Job failed: ${job.name}-${job.id}`, error.stack);
  }
}
