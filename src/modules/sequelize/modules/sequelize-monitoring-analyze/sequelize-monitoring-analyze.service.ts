import { Injectable, Logger } from "@nestjs/common";
import { SequelizeRequestLog } from "../../entites/request-log.entity";
import { SequelizeDBLog } from "../../entites/sequelize-log.entity";
import { SequelizeJobLog } from "../../entites/job-log.entity";
import { InjectModel } from "@nestjs/sequelize";
import { MonitoringService } from "../../../shared/monitoring/services/monitoring.service";
import { MonitoringBaseFilterDto } from "../../../shared/monitoring/dtos/base-filter.dto";
import { MonitoringRequestFilterDto } from "../../../shared/monitoring/dtos/monitoring-requests-filter.dto";
import { MonitoringSequelizeFilterDto } from "../../../shared/monitoring/dtos/monitoring-sequelize-filter.dto";
import { MonitoringJobFilterDto } from "../../../shared/monitoring/dtos/jobs-filter.dto";
import { MonitoringListResponse } from "../../../../models/list.response";
import { Op } from "sequelize";
import moment from "moment-timezone";

@Injectable()
export class SequelizeMonitoringAnalyzeService extends MonitoringService {
  private readonly logger = new Logger("MonitoringAnalyzeService");
  constructor(
    @InjectModel(SequelizeDBLog) private dbLog: typeof SequelizeDBLog,
    @InjectModel(SequelizeJobLog) private jobLog: typeof SequelizeJobLog,
    @InjectModel(SequelizeRequestLog) private requestLog: typeof SequelizeRequestLog,
  ) {
    super();
  }

  public async findAllRequests(
    filterDto: MonitoringRequestFilterDto,
  ): Promise<MonitoringListResponse<SequelizeRequestLog>> {
    const { fromDate, toDate } = this.getFilterDates(filterDto);
    const condition = {
      createdAt: {
        [Op.between]: [fromDate, toDate],
      },
    };
    const { exception, url, method, success, user } = filterDto;
    if (exception) {
      condition["response.statusCode"] = 500;
    }
    if (url) {
      condition["url"] = { [Op.like]: `%${url}%` };
    }
    if (method) {
      condition["method"] = { [Op.in]: method.split(",") };
    }
    if (success) {
      condition["success"] = JSON.parse(success);
    }
    if (user) {
      condition["user"]["id"] = user;
    }

    const { perPage, skip } = this.getPaginationData(filterDto);
    const sortKey = filterDto.sortKey ?? "createdAt";

    const { rows, count } = await this.requestLog.findAndCountAll({
      where: condition,
      order: [[sortKey, "DESC"]],
      offset: skip,
      limit: perPage,
    });

    return { total: count, data: rows };
  }

  public async findRequest(id: string): Promise<SequelizeRequestLog> {
    return this.requestLog.findByPk(id);
  }

  public async findAllDb(
    filterDto: MonitoringSequelizeFilterDto,
  ): Promise<MonitoringListResponse<SequelizeDBLog>> {
    const { fromDate, toDate } = this.getFilterDates(filterDto);
    const condition = { createdAt: { [Op.between]: [fromDate, toDate] } };
    const { tableName } = filterDto;

    if (tableName) {
      condition["table"] = tableName;
    }

    const { perPage, skip } = this.getPaginationData(filterDto);
    const sortKey = filterDto.sortKey ?? "createdAt";

    const data = await this.dbLog.findAndCountAll({
      where: condition,
      order: [[sortKey, "DESC"]],
      offset: skip,
      limit: perPage,
    });

    return { total: data.count, data: data.rows };
  }

  public async findDbLog(id: string): Promise<SequelizeDBLog> {
    return this.dbLog.findByPk(id);
  }

  public async findDbOptions(): Promise<any> {
    const tableNames = await this.dbLog
      .findAll({
        where: { table: { [Op.ne]: null } },
        attributes: ["table"],
        group: "table",
      })
      .then((result) => result.map((e) => e.table));

    return { tableNames };
  }

  public async findAllJobs(
    filterDto: MonitoringJobFilterDto,
  ): Promise<MonitoringListResponse<SequelizeJobLog>> {
    const { fromDate, toDate } = this.getFilterDates(filterDto);
    const condition = { createdAt: { [Op.between]: [fromDate, toDate] } };
    const { success, name } = filterDto;
    if (name) {
      condition["name"] = { [Op.like]: `%${name}%` };
    }
    if (success) {
      condition["success"] = JSON.parse(success);
    }
    const { perPage, skip } = this.getPaginationData(filterDto);
    const sortKey = filterDto.sortKey ?? "createdAt";

    const data = await this.jobLog.findAndCountAll({
      where: condition,
      order: [[sortKey, "DESC"]],
      offset: skip,
      limit: perPage,
    });

    return { total: data.count, data: data.rows };
  }

  public async findJobLog(id: string): Promise<SequelizeJobLog> {
    return this.jobLog.findByPk(id);
  }

  public async analyzeRequests(filterDto: MonitoringBaseFilterDto): Promise<any> {
    const { fromDate, toDate } = this.getFilterDates(filterDto);
    const condition = {
      "response.statusCode": { [Op.ne]: 404 },
      createdAt: {
        [Op.between]: [fromDate, toDate],
      },
    };

    // total requests count
    const total = await this.requestLog.count();

    // success requests count
    const success = await this.requestLog.count({
      where: {
        success: true,
        ...condition,
      },
    });

    // exceptions count
    const exceptions = await this.requestLog.count({
      where: {
        ...condition,
        "response.statusCode": 500,
      },
    });

    const requests = await this.requestLog
      .findAll({ where: condition })
      .then((result) => result.map((e) => e.get()));

    const duration = [];
    const durationBoundaries = [0, 20, 40, 80, 130, 150, 180, 200, 500, 1000, 2000];
    for (let i = 0; i < durationBoundaries.length - 1; i++) {
      try {
        const list = requests.filter(
          (e) =>
            durationBoundaries[i] <= +e["duration"] && +e["duration"] < durationBoundaries[i + 1],
        );
        if (list.length != 0) {
          duration.push({
            id: durationBoundaries[i],
            count: list.length,
            data: list.map((request) => {
              const { duration, url, method, success } = request;
              return { duration, url, method, success };
            }),
          });
        }
      } catch (error) {
        this.logger.error(error);
      }
    }

    // get requests grouped by end-point (min-max for each group)
    const durations = duration.flatMap((e) => e.data);
    const durationURLs = [];
    const methods = [...new Set(durations.map((obj) => obj.method))];
    [...new Set(durations.map((obj) => `${obj.url}`.split("?")[0]))].forEach((obj) => {
      methods.forEach((method) => {
        const urls = durations.filter((e) => `${e.url}`.split("?")[0] == obj && e.method == method);
        const success = urls.filter((e) => e.success == true);
        const min =
          success.length == 0 ? 0 : success.map((e) => e.duration).reduce((a, b) => Math.min(a, b));
        const max =
          success.length == 0 ? 0 : success.map((e) => e.duration).reduce((a, b) => Math.max(a, b));
        const average =
          success.length == 0 ? 0 : success.map((e) => e.duration).reduce((a, b) => a + b);
        if (urls.length > 0) {
          try {
            durationURLs.push({
              method,
              url: obj,
              min,
              max,
              average: average / Math.max(success.length, 1),
              count: success.length,
            });
          } catch (error) {
            console.error(error);
          }
        }
      });
    });

    const createdAt = [];
    const createdAtBoundaries = this.getRange(fromDate, toDate);
    if (createdAtBoundaries.length != 0) {
      createdAtBoundaries.push(toDate);
    }

    for (let i = 0; i < createdAtBoundaries.length - 1; i++) {
      try {
        const list = requests.filter((e) => {
          const start = moment(createdAtBoundaries[i]);
          const createdAt = moment(e["createdAt"]);
          const end = moment(createdAtBoundaries[i + 1]);
          return createdAt.isAfter(start) && createdAt.isBefore(end);
        });
        if (list.length != 0) {
          createdAt.push({
            id: createdAtBoundaries[i],
            count: list.length,
            data: list.map((request) => {
              const { id, url, method, success, createdAt } = request;
              return { id, url, method, success, createdAt };
            }),
          });
        }
      } catch (error) {
        this.logger.error(error);
      }
    }

    return {
      fromDate,
      toDate,
      total,
      success,
      exceptions,
      duration,
      durationURLs,
      createdAt,
      durationBoundaries,
    };
  }
}
