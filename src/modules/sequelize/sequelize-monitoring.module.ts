import { DynamicModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { SequelizeRequestLoggerMiddleware } from './middlewares/sequelize-request-logger.middleware';
import { SequelizeMonitoringDbService } from './modules/sequelize-monitoring-db/sequelize-monitoring-db.service';
import { SequelizeMonitoringJobService } from './modules/sequelize-monitoring-job/sequelize-monitoring-job.service';
import { SequelizeMonitoringAnalyzeModule } from './modules/sequelize-monitoring-analyze/sequelize-monitoring-analyze.module';
import { MonitoringAuthenticationModule } from '../authentication/monitoring-authentication.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({})
export class SequelizeMonitoringModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        if (process.env.MONITORING_REQUEST_SAVE_ENABLED == 'true') {
            consumer.apply(SequelizeRequestLoggerMiddleware).forRoutes('*');
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
                MonitoringAuthenticationModule,
                SequelizeMonitoringAnalyzeModule,
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
            module: SequelizeMonitoringModule,
        }
    }
}