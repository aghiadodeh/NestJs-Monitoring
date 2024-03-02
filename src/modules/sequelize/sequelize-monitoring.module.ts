import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeRequestLoggerMiddleware } from './middlewares/sequelize-request-logger.middleware';
import { SequelizeMonitoringDbService } from './modules/sequelize-monitoring-db/sequelize-monitoring-db.service';
import { SequelizeMonitoringJobService } from './modules/sequelize-monitoring-job/sequelize-monitoring-job.service';
import { SequelizeMonitoringAnalyzeModule } from './modules/sequelize-monitoring-analyze/sequelize-monitoring-analyze.module';
import { MonitoringAuthenticationModule } from '../authentication/monitoring-authentication.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        MonitoringAuthenticationModule,
        SequelizeMonitoringAnalyzeModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, 'browser'),
            exclude: ['/api/(.*)'],
            serveRoot: '/monitoring'
        }),
    ],
    providers: [
        SequelizeMonitoringDbService,
        SequelizeMonitoringJobService,
        SequelizeRequestLoggerMiddleware,
    ],
    exports: [
        SequelizeMonitoringDbService,
        SequelizeMonitoringJobService,
        MonitoringAuthenticationModule,
        SequelizeMonitoringAnalyzeModule,
        SequelizeRequestLoggerMiddleware,
    ],
})
export class SequelizeMonitoringModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        if (process.env.MONITORING_REQUEST_LOG_ENABLED == 'true') {
            consumer.apply(SequelizeRequestLoggerMiddleware).forRoutes('*');
        }
    }
}