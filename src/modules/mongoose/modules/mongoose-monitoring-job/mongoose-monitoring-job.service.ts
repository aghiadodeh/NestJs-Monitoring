import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { RequestLog } from "../../entities/request-log.entity";
import { MongooseLog } from "../../entities/mongoose-log.entity";
import { JobLog } from "../../entities/job-log.entity";
import {
  MonitoringJobService,
  ICreateJob,
} from "../../../shared/monitoring/services/monitoring-job.service";
import { MONITORING_MONGO_CONNECTION } from "../../../shared/config/config";

@Injectable()
export class MongooseMonitoringJobService extends MonitoringJobService {
  constructor(
    @InjectModel(JobLog.name, MONITORING_MONGO_CONNECTION) private jobLog: Model<JobLog>,
    @InjectModel(RequestLog.name, MONITORING_MONGO_CONNECTION)
    private requestLog: Model<RequestLog>,
    @InjectModel(MongooseLog.name, MONITORING_MONGO_CONNECTION)
    private mongooseLog: Model<MongooseLog>,
  ) {
    super();
  }

  override async create(iCreateJob: ICreateJob): Promise<Partial<JobLog>> {
    const _id = new mongoose.Types.ObjectId();
    await this.jobLog.create({ _id, ...iCreateJob });
    return { _id, ...iCreateJob } as any;
  }

  override async clearAll(): Promise<void> {
    await this.jobLog.deleteMany({});
    await this.requestLog.deleteMany({});
    await this.mongooseLog.deleteMany({});
  }
}
