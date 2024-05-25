import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { MongooseLog } from "../../entities/mongoose-log.entity";
import { RequestLog } from "../../entities/request-log.entity";
import { JobLog } from "../../entities/job-log.entity";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import {
  MONITORING_MONGO_CONNECTION,
  MONITORING_QUEUE,
  MONITORING_INSERT_DB_LOG,
} from "../../../shared/config/config";

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
  ) {
    this.watchQueries();
  }

  protected watchQueries(): void {
    if (
      process.env.MONITORING_DB_LOG_ENABLED == "true" ||
      process.env.MONITORING_DB_LOG_SAVE_ENABLED == "true"
    ) {
      mongoose.set("debug", async (collectionName, method, query, options) => {
        const collections = [
          this.mongooseLog.collection.name,
          this.requestLog.collection.name,
          this.jobLog.collection.name,
        ];
        if (!collections.includes(collectionName)) {
          if (!["createIndex"].includes(method)) {
            await this.saveQuery(collectionName, method, query, options);
          }
        }
      });
    }
  }

  protected async saveQuery(
    collectionName: string,
    method: string,
    query: object,
    options: object,
  ): Promise<void> {
    Object.keys(options).forEach((key) => (options[key] === undefined ? delete options[key] : {}));
    if (process.env.MONITORING_DB_LOG_ENABLED == "true") {
      console.log(
        "\x1B[0;36mMongoose:\x1B[0m:",
        `${collectionName}.${method}(`,
        query,
        ",",
        options,
        ")",
        "\n---------------------",
      );
    }
    if (process.env.MONITORING_DB_LOG_SAVE_ENABLED == "true") {
      const data = {
        collectionName,
        method,
        query,
        options,
      };
      if (process.env.MONITORING_REDIS_HOST && process.env.MONITORING_REDIS_PORT) {
        await this.queue.add(MONITORING_INSERT_DB_LOG, data);
      } else {
        this.mongooseLog.create(data);
      }
    }
  }
}
