import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
import { RequestLog } from '../../entites/request-log.entity';
import { MongooseLog } from '../../entites/mongoose-log.entity';
import { JobLog } from '../../entites/job-log.entity';
import { MonitoringJobService, ICreateJob } from "../../../shared/monitoring/services/monitoring-job.service";


@Injectable()
export class MongooseMonitoringJobService extends MonitoringJobService {
    constructor(
        @InjectModel(JobLog.name) private jobLog: Model<JobLog>,
        @InjectModel(RequestLog.name) private requestLog: Model<RequestLog>,
        @InjectModel(MongooseLog.name) private mongooseLog: Model<MongooseLog>,
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
