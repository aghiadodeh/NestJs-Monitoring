import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { SequelizeMonitoringAnalyzeService } from "./sequelize-monitoring-analyze.service";
import { MonitoringAuthenticationGuard } from "../../../authentication/guards/monitoring-authentication.guard";
import { MonitoringRequestFilterDto } from "../../../../modules/shared/monitoring/dtos/monitoring-requests-filter.dto";
import { MonitoringListResponse } from "../../../../models/list.response";
import { SequelizeRequestLog } from "../../entites/request-log.entity";
import { MonitoringBaseFilterDto } from "../../../../modules/shared/monitoring/dtos/base-filter.dto";
import { MonitoringSequelizeFilterDto } from "../../../shared/monitoring/dtos/monitoring-sequelize-filter.dto";
import { SequelizeDBLog } from "../../entites/sequelize-log.entity";
import { SequelizeJobLog } from "../../entites/job-log.entity";
import { MonitoringJobFilterDto } from "../../../../modules/shared/monitoring/dtos/jobs-filter.dto";

@Controller("monitoring/sequelize")
@UseGuards(MonitoringAuthenticationGuard)
export class SequelizeMonitoringAnalyzeController {
  constructor(
    private readonly sequelizeMonitoringAnalyzeService: SequelizeMonitoringAnalyzeService,
  ) {}

  @Get("requests")
  findAllRequests(
    @Query() filterDto: MonitoringRequestFilterDto,
  ): Promise<MonitoringListResponse<SequelizeRequestLog>> {
    return this.sequelizeMonitoringAnalyzeService.findAllRequests(filterDto);
  }

  @Get("requests/analyze")
  analyzeRequests(@Query() filterDto: MonitoringBaseFilterDto): Promise<any> {
    return this.sequelizeMonitoringAnalyzeService.analyzeRequests(filterDto);
  }

  @Get("requests/view/:id")
  findRequest(@Param("id") id: string): Promise<SequelizeRequestLog> {
    return this.sequelizeMonitoringAnalyzeService.findRequest(id);
  }

  @Get("db-logs")
  findAllDb(
    @Query() filterDto: MonitoringSequelizeFilterDto,
  ): Promise<MonitoringListResponse<SequelizeDBLog>> {
    return this.sequelizeMonitoringAnalyzeService.findAllDb(filterDto);
  }

  @Get("db-logs/view/:id")
  findDbLog(@Param("id") id: string): Promise<SequelizeDBLog> {
    return this.sequelizeMonitoringAnalyzeService.findDbLog(id);
  }

  @Get("db-logs-options")
  findDbOptions(): Promise<any> {
    return this.sequelizeMonitoringAnalyzeService.findDbOptions();
  }

  @Get("jobs")
  findAllJobs(
    @Query() filterDto: MonitoringJobFilterDto,
  ): Promise<MonitoringListResponse<SequelizeJobLog>> {
    return this.sequelizeMonitoringAnalyzeService.findAllJobs(filterDto);
  }

  @Get("jobs/:id")
  findJobLog(@Param("id") id: string): Promise<SequelizeJobLog> {
    return this.sequelizeMonitoringAnalyzeService.findJobLog(id);
  }
}
