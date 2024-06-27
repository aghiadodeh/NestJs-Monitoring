import { Injectable } from "@nestjs/common";
import { SequelizeRequestLog } from "../../entities/request-log.entity";
import { SequelizeDBLog } from "../../entities/sequelize-log.entity";
import { SequelizeJobLog } from "../../entities/job-log.entity";
import { InjectModel } from "@nestjs/sequelize";
import {
  MonitoringJobService,
  ICreateJob,
} from "../../../shared/monitoring/services/monitoring-job.service";

@Injectable()
export class SequelizeMonitoringJobService extends MonitoringJobService {
  constructor(
    @InjectModel(SequelizeDBLog) private dbLog: typeof SequelizeDBLog,
    @InjectModel(SequelizeJobLog) private jobLog: typeof SequelizeJobLog,
    @InjectModel(SequelizeRequestLog) private requestLog: typeof SequelizeRequestLog,
  ) {
    super();
  }

  override async create(iCreateJob: ICreateJob): Promise<Partial<SequelizeJobLog>> {
    return this.jobLog.create(iCreateJob as any);
  }

  override async clearAll(): Promise<void> {
    await this.dbLog.destroy({});
    await this.jobLog.destroy({});
    await this.requestLog.destroy({});
  }
}
