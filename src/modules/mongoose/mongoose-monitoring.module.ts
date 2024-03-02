import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RequestLog, RequestLogSchema } from './entites/request-log.entity';
import { MongooseRequestLoggerMiddleware } from './middlewares/mongoose-request-logger.middleware';
import { MonitoringAuthenticationModule } from '../authentication/monitoring-authentication.module';
import { MongooseLog, MongooseLogSchema } from './entites/mongoose-log.entity';
import { JobLog, JobLogSchema } from './entites/job-log.entity';
import { MongooseAnalyzeModule } from './modules/mongoose-analyze/mongoose-analyze.module';
import { MongooseMonitoringJobService } from './modules/mongoose-monitoring-job/mongoose-monitoring-job.service';
import { MongooseMonitoringDbService } from './modules/mongoose-monitoring-db/mongoose-monitoring-db.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

const mongooseSchemas = MongooseModule.forFeature([
  { name: JobLog.name, schema: JobLogSchema },
  { name: RequestLog.name, schema: RequestLogSchema },
  { name: MongooseLog.name, schema: MongooseLogSchema },
]);

@Module({
  imports: [
    mongooseSchemas,
    MongooseAnalyzeModule,
    MonitoringAuthenticationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'browser'),
      exclude: ['/api/(.*)'],
      serveRoot: '/monitoring'
    }),
  ],
  providers: [
    MongooseMonitoringDbService,
    MongooseMonitoringJobService,
    MongooseRequestLoggerMiddleware,
  ],
  exports: [
    mongooseSchemas,
    MongooseAnalyzeModule,
    MongooseMonitoringDbService,
    MongooseMonitoringJobService,
    MonitoringAuthenticationModule,
    MongooseRequestLoggerMiddleware,
  ],
})
export class MongooseMonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    if (process.env.MONITORING_REQUEST_LOG_ENABLED == 'true') {
      consumer.apply(MongooseRequestLoggerMiddleware).forRoutes('*');
    }
  }
}
