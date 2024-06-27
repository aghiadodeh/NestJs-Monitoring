import { DynamicModule, MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { RequestLog, RequestLogSchema } from "./entities/request-log.entity";
import { MongooseRequestLoggerMiddleware } from "./middlewares/mongoose-request-logger.middleware";
import { MonitoringAuthenticationModule } from "../authentication/monitoring-authentication.module";
import { MongooseLog, MongooseLogSchema } from "./entities/mongoose-log.entity";
import { JobLog, JobLogSchema } from "./entities/job-log.entity";
import { MongooseAnalyzeModule } from "./modules/mongoose-analyze/mongoose-analyze.module";
import { MongooseMonitoringJobService } from "./modules/mongoose-monitoring-job/mongoose-monitoring-job.service";
import { MongooseMonitoringDbService } from "./modules/mongoose-monitoring-db/mongoose-monitoring-db.service";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { BullModule } from "@nestjs/bull";
import { MongooseMonitoringConsumer } from "./modules/mongoose-monitoring-consumer/mongoose-monitoring-consumer";
import { MONITORING_MONGO_CONNECTION, MONITORING_QUEUE } from "../shared/config/config";

const mongooseSchemas = MongooseModule.forFeature(
  [
    { name: JobLog.name, schema: JobLogSchema },
    { name: RequestLog.name, schema: RequestLogSchema },
    { name: MongooseLog.name, schema: MongooseLogSchema },
  ],
  MONITORING_MONGO_CONNECTION,
);

@Module({})
export class MongooseMonitoringModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    if (process.env.MONITORING_REQUEST_SAVE_ENABLED == "true") {
      consumer.apply(MongooseRequestLoggerMiddleware).forRoutes("*");
    }
  }

  static forRoot(): DynamicModule {
    const imports: any[] = [];

    if (process.env.MONITORING_DASHBOARD_ENABLED != "false") {
      imports.push(
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, "browser"),
          exclude: ["/api/(.*)"],
          serveRoot: "/monitoring",
        }),
      );
    }

    if (process.env.MONITORING_MONGO_DB_URL && process.env.MONITORING_DB_NAME) {
      imports.push(
        MongooseModule.forRoot(process.env.MONITORING_MONGO_DB_URL, {
          user: process.env.MONITORING_DB_USERNAME,
          pass: process.env.MONITORING_DB_PASSWORD,
          dbName: process.env.MONITORING_DB_NAME,
          connectionName: MONITORING_MONGO_CONNECTION,
          writeConcern: { w: 0, wtimeoutMS: 180 * 1000 },
        }),
      );
    }

    return {
      imports: [
        ...imports,
        mongooseSchemas,
        MongooseAnalyzeModule,
        MonitoringAuthenticationModule,
        BullModule.registerQueue({ name: MONITORING_QUEUE }),
      ],
      providers: [
        MongooseMonitoringConsumer,
        MongooseMonitoringDbService,
        MongooseMonitoringJobService,
        MongooseRequestLoggerMiddleware,
      ],
      exports: [
        mongooseSchemas,
        MongooseAnalyzeModule,
        MongooseMonitoringConsumer,
        MongooseMonitoringDbService,
        MongooseMonitoringJobService,
        MonitoringAuthenticationModule,
        MongooseRequestLoggerMiddleware,
      ],
      module: MongooseMonitoringModule,
    };
  }
}
