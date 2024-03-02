import { Module } from '@nestjs/common';
import { MonitoringAuthenticationService } from './monitoring-authentication.service';
import { MonitoringAuthenticationController } from './monitoring-authentication.controller';

@Module({
  controllers: [MonitoringAuthenticationController],
  providers: [MonitoringAuthenticationService],
})
export class MonitoringAuthenticationModule {}
