import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { MongooseAnalyzeService } from "./mongoose-analyze.service";
import { MonitoringAuthenticationGuard } from "../../../../modules/authentication/guards/monitoring-authentication.guard";
import { MonitoringRequestFilterDto } from "../../../../modules/shared/monitoring/dtos/monitoring-requests-filter.dto";
import { MonitoringListResponse } from "../../../../models/list.response";
import { RequestLog } from "../../entities/request-log.entity";
import { MonitoringBaseFilterDto } from "../../../../modules/shared/monitoring/dtos/base-filter.dto";
import { MonitoringMongoFilterDto } from "../../../shared/monitoring/dtos/monitoring-mongo-filter.dto";
import { MongooseLog } from "../../entities/mongoose-log.entity";
import { JobLog } from "../../entities/job-log.entity";
import { MonitoringJobFilterDto } from "../../../../modules/shared/monitoring/dtos/jobs-filter.dto";

@Controller({ path: "monitoring/mongoose", version: '' })
@UseGuards(MonitoringAuthenticationGuard)
export class MongooseAnalyzeController {
  constructor(private readonly mongooseAnalyzeService: MongooseAnalyzeService) { }

  @Get("requests")
  findAllRequests(
    @Query() filterDto: MonitoringRequestFilterDto,
  ): Promise<MonitoringListResponse<RequestLog>> {
    return this.mongooseAnalyzeService.findAllRequests(filterDto);
  }

  @Get("requests/analyze")
  analyzeRequests(@Query() filterDto: MonitoringBaseFilterDto): Promise<any> {
    return this.mongooseAnalyzeService.analyzeRequests(filterDto);
  }

  @Get("requests/view/:id")
  findRequest(@Param("id") id: string): Promise<RequestLog> {
    return this.mongooseAnalyzeService.findRequest(id);
  }

  @Get("mongo-logs")
  findAllMongooseLogs(
    @Query() filterDto: MonitoringMongoFilterDto,
  ): Promise<MonitoringListResponse<MongooseLog>> {
    return this.mongooseAnalyzeService.findAllMongooseLogs(filterDto);
  }

  @Get("jobs")
  findAllJobs(@Query() filterDto: MonitoringJobFilterDto): Promise<MonitoringListResponse<JobLog>> {
    return this.mongooseAnalyzeService.findAllJobs(filterDto);
  }

  @Get("jobs/:id")
  findJobLog(@Param("id") id: string): Promise<JobLog> {
    return this.mongooseAnalyzeService.findJobLog(id);
  }

  @Get("mongo-logs-options")
  findMongooseOptions() {
    return this.mongooseAnalyzeService.findMongooseOptions();
  }

  @Get("mongo-logs/view/:id")
  findMongooseLog(@Param("id") id: string): Promise<MongooseLog> {
    return this.mongooseAnalyzeService.findMongooseLog(id);
  }
}
