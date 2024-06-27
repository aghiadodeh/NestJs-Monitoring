import { DynamicModule, Global, Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MongooseMonitoringModule } from "./mongoose/mongoose-monitoring.module";
import { SequelizeMonitoringModule } from "./sequelize/sequelize-monitoring.module";
import { BullModule } from "@nestjs/bull";

interface MonitoringOptions {
  orm: "mongoose" | "sequelize";
}

@Global()
@Module({})
export class MonitoringModule {
  static forRoot(options: MonitoringOptions): DynamicModule {
    const orm = options?.orm ?? "mongoose";
    const imports: any[] = [];
    const exports: any[] = [];

    if (orm == "mongoose") {
      imports.push(MongooseMonitoringModule.forRoot());
      exports.push(MongooseMonitoringModule.forRoot());
    } else {
      imports.push(SequelizeMonitoringModule.forRoot());
      exports.push(SequelizeMonitoringModule.forRoot());
    }

    return {
      imports: [
        ...imports,
        BullModule.forRoot({
          redis: {
            host: process.env.MONITORING_REDIS_HOST ?? "localhost",
            port: +process.env.MONITORING_REDIS_PORT ?? 6379,
          },
          defaultJobOptions: {
            removeOnComplete: true,
            timeout: 180 * 1000, // 3 minute
            attempts: 5,
            backoff: {
              type: "fixed",
              delay: 5000, // 5 seconds
            },
          },
        }),
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({ secret: process.env.MONITORING_JWT_SECRET }),
      ],
      providers: [JwtService],
      exports: [JwtModule, PassportModule, ...exports],
      module: MonitoringModule,
    };
  }
}
