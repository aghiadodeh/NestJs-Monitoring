import { DynamicModule, MiddlewareConsumer, Module, NestModule, Type } from '@nestjs/common';
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

@Module({})
export class MongooseMonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    if (process.env.MONITORING_REQUEST_SAVE_ENABLED == 'true') {
      consumer.apply(MongooseRequestLoggerMiddleware).forRoutes('*');
    }
  }

  static forRoot(): DynamicModule {
    const imports: any[] = [];

    if (process.env.MONITORING_DASHBOARD_ENABLED != 'false') {
      imports.push(ServeStaticModule.forRoot({
        rootPath: join(__dirname, 'browser'),
        exclude: ['/api/(.*)'],
        serveRoot: '/monitoring'
      }));
    }

    return {
      imports: [
        ...imports,
        mongooseSchemas,
        MongooseAnalyzeModule,
        MonitoringAuthenticationModule,
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
      module: MongooseMonitoringModule,
    }
  }
}
