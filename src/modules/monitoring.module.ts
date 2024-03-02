import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseMonitoringModule } from './mongoose/mongoose-monitoring.module';
import { SequelizeMonitoringModule } from './sequelize/sequelize-monitoring.module';

interface MonitoringOptions {
  orm: 'mongoose' | 'sequelize';
}

@Global()
@Module({})
export class MonitoringModule {
  static forRoot(options: MonitoringOptions): DynamicModule {
    const orm = options?.orm ?? 'mongoose';
    const imports: Type[] = [];
    if (orm == 'mongoose') {
      imports.push(MongooseMonitoringModule);
    } else {
      imports.push(SequelizeMonitoringModule);
    }
    
    return {
      imports: [
        ...imports,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({ secret: process.env.MONITORING_JWT_SECRET }),
      ],
      providers: [
        JwtService,
      ],
      exports: [
        JwtModule,
        PassportModule,
        ...imports,
      ],
      module: MonitoringModule,
    }
  }
}
