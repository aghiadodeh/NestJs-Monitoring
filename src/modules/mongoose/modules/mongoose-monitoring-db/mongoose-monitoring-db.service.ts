import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MongooseLog } from "../../entities/mongoose-log.entity";
import { RequestLog } from "../../entities/request-log.entity";
import { JobLog } from "../../entities/job-log.entity";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import {
  MONITORING_INSERT_DB_LOG,
  MONITORING_MONGO_CONNECTION,
  MONITORING_QUEUE,
} from "../../../shared/config/config";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { IMongooseTracking } from "../../plugins/mongoose-duration-tracking.plugin";

export let mongooseEventEmitter: EventEmitter2;

@Injectable()
export class MongooseMonitoringDbService {
  constructor(
    @InjectQueue(MONITORING_QUEUE)
    private queue: Queue,
    @InjectModel(JobLog.name, MONITORING_MONGO_CONNECTION)
    private jobLog: Model<JobLog>,
    @InjectModel(RequestLog.name, MONITORING_MONGO_CONNECTION)
    private requestLog: Model<RequestLog>,
    @InjectModel(MongooseLog.name, MONITORING_MONGO_CONNECTION)
    private mongooseLog: Model<MongooseLog>,
    eventEmitter: EventEmitter2,
  ) {
    mongooseEventEmitter = eventEmitter;
  }

  @OnEvent("IMongooseTracking")
  public async handleMongooseTrackingEvent(iTracking: IMongooseTracking): Promise<void> {
    try {
      const { op, collection, piplines, query, options, update, duration } = iTracking;
      const collections = [
        this.mongooseLog.collection.name,
        this.requestLog.collection.name,
        this.jobLog.collection.name,
      ];

      if (collections.includes(collection)) return;

      if (process.env.MONITORING_DB_LOG_ENABLED == "true") {
        console.log(
          "\x1B[0;36mMongoose:\x1B[0m",
          `\x1B[0;33m${collection}\x1B[0m.${op}(`,
          piplines ?? query,
          ",\n",
          update ?? "",
          update ? ",\n" : "",
          options ?? "{}",
          ",\n",
          ")\n",
          "\x1B[0;34mQuery duration:\x1B[0m",
          `${duration}ms`,
          "\n---------------------",
        );
      }
      if (process.env.MONITORING_DB_LOG_SAVE_ENABLED == "true") {
        const data = {
          collectionName: collection,
          method: op,
          query: piplines ?? query,
          update,
          duration,
        };
        if (process.env.MONITORING_REDIS_HOST && process.env.MONITORING_REDIS_PORT) {
          await this.queue.add(MONITORING_INSERT_DB_LOG, data);
        } else {
          await this.mongooseLog.create(data);
        }
      }
    } catch (_) { }
  }
}
