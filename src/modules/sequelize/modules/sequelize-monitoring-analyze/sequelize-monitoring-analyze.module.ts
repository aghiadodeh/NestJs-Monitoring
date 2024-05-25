import { Module } from "@nestjs/common";
import { SequelizeMonitoringAnalyzeService } from "./sequelize-monitoring-analyze.service";
import { SequelizeMonitoringAnalyzeController } from "./sequelize-monitoring-analyze.controller";

@Module({
  controllers: [SequelizeMonitoringAnalyzeController],
  providers: [SequelizeMonitoringAnalyzeService],
})
export class SequelizeMonitoringAnalyzeModule {}
