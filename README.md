# NestJs Monitoring
Debug assistant for the **NestJS** framework. It provides insight into the **Requests** coming into your application, **Exceptions**, **Database queries** and **Jobs**

## NOTE:
- This Package works only with ***Mongoose*** and ***Sequelize***.

## Screenshots:

| | |
|:-------------------------:|:-------------------------:|
|<img src="https://github.com/aghiadodeh/Nestjs-Monitoring-Dashboard/blob/main/screenshots/Analyze.png?raw=true">|<img src="https://github.com/aghiadodeh/Nestjs-Monitoring-Dashboard/blob/main/screenshots/Requests.png?raw=true">
|<img src="https://github.com/aghiadodeh/Nestjs-Monitoring-Dashboard/blob/main/screenshots/Request_Exception.png?raw=true">|<img src="https://github.com/aghiadodeh/Nestjs-Monitoring-Dashboard/blob/main/screenshots/DB.png?raw=true">
|<img src="https://github.com/aghiadodeh/Nestjs-Monitoring-Dashboard/blob/main/screenshots/Job.png?raw=true">|<img src="https://github.com/aghiadodeh/Nestjs-Monitoring-Dashboard/blob/main/screenshots/Request_Details.png?raw=true">


## Installation:
```shell
npm i nestjs-monitoring
```

## Usage:
**NestJs Monitoring** provide debugging through ***apis***, You can use it by:
1. Use built-in package dashboard by accessing: `http://localhost:3000/monitoring`.
2. Clone [Monitoring-Dashboard](https://github.com/aghiadodeh/Nestjs-Monitoring-Dashboard) from Github which built specifically for this package.


## Setup:
package can be managed by `.env` file
```env
# enable call monitoring apis (ex: disable it in production environment)
MONITORING_APIS_ENABLED = 'true'

# enable monitoring with browser (dashboard)
MONITORING_DASHBOARD_ENABLED = 'true'

# require authentication to get monitoring data
MONITORING_AUTH_REQUIRED = 'true'

# authentication credentials
MONITORING_USERNAME = 'monitoring'
MONITORING_PASSWORD = '123456'
MONITORING_JWT_SECRET = '*******' # change with strong secret-key

# log all db queries in console
MONITORING_DB_LOG_ENABLED = 'true'

# save all db queries
MONITORING_DB_LOG_SAVE_ENABLED = 'true'

# save all requests traffic in application
MONITORING_REQUEST_SAVE_ENABLED = 'true'
```

And you must use the Monitoring `GlobalFilters` and `GlobalPrefix` in your `src/main.ts`:
```typescript
import { MonitoringExceptionFilter } from "nestjs-monitoring";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // add monitoring exception-filter
  app.useGlobalFilters(new MonitoringExceptionFilter());

  // global prefix `/api` is required
  app.setGlobalPrefix("/api");

  await app.listen(3000);
}

bootstrap();
```

## Access Monitoring Dashboard:
You can open built-in monitoring dashboard through

remote: `https://your-domain.com/monitoring`

localhost: `http://localhost:3000/monitoring`

## i18n:
This package use [NestJs-i18n](https://www.npmjs.com/package/nestjs-i18n) for translate the response message, for translate the string from json file successfully you must name your i18n json file with `i18n.json` inside your language folder:

    .
    ├── /node_modules
    ├── /src                    
    │   ├── /i18n          
    │   │    ├── /en                    
    │   │    │    ├── i18n.json # english translate json file
    │   │    ├── /fr       
    │   │    │    ├── i18n.json 
    │   └── main.ts               
    └── ...
 
## Setup Mongoose Monitoring:
Add DB config to `.env` file:
```env
# monitoring db config
MONITORING_DB_NAME = 'monitoring_db'
MONITORING_DB_USERNAME = ''
MONITORING_DB_PASSWORD = ''
MONITORING_MONGO_DB_URL = 'mongodb://127.0.0.1:27017'
```

add `MonitoringModule` to your `src/app.module.ts`:
```typescript
import { MonitoringModule } from "nestjs-monitoring";

@Module({
  imports: [
    MonitoringModule.forRoot({ orm: 'mongoose' }), // <-- add mongoose here
    // ...,
  ],
})
export class AppModule {}
```
## Save Job Logs Manually:

You can create your own job for background operations:
```typescript
import { MongooseMonitoringJobService } from 'nestjs-monitoring';

@Injectable()
export class AuthenticationService {
    constructor(private mentoringJobService: MongooseMonitoringJobService) {}

    async sendVerificationCode(): Promise<void> {
        const number = "+1xxxxxxxxx";
        const code = "111111";
        try {
            await this.smsService.sendMessage(
                number,
                `Your verification code is: ${code}`,
            );
        } catch (error) {
            // add log for sending sms error
            this.mentoringJobService.create({
                name: "send-SMS",
                success: false,
                metadata: [
                    { number, code, datetime: new Date().toISOString() },
                    { error },
                ],
            });
        }
    }
}
```
Create Job params:

```typescript
interface ICreateJob {
    name: string; // tag of job
    success?: boolean; // default is true
    metadata: object[]; // array of results
};
```
## Clear Logs:
Logs take up a lot of storage space in a database, so you have to clear logs every period of time:

```typescript
import { MongooseMonitoringJobService } from "nestjs-monitoring";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class LogsCronJob {
  constructor(private monitoringJobService: MongooseMonitoringJobService) {}

  // clear logs every day
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteAllLogs(): Promise<void> {
    await this.monitoringJobService.clearAll();
  }
}
```


## Monitoring APIs:
| API  | End point  |
|:----------|:----------|
| Authentication    | {{baseUrl}}/api/monitoring/authentication    |
| Analyze Requests    | {{baseUrl}}/api/monitoring/mongoose/requests/analyze    |
| Requests Log    | {{baseUrl}}/api/monitoring/mongoose/requests    |
| Jobs Log    | {{baseUrl}}/api/monitoring/mongoose/jobs    |
| Database Queries Log    | {{baseUrl}}/api/monitoring/mongoose/mongo-logs    |
<hr />

 
## Setup Sequelize Monitoring:

add `MonitoringModule` to your `src/app.module.ts`:
```typescript
import { MonitoringModule } from "nestjs-monitoring";

@Module({
  imports: [
    MonitoringModule.forRoot({ orm: 'sequelize' }), // <-- add sequelize here
    // ...,
  ],
})
export class AppModule {}
```

Add Sequelize Models to your SequelizeModule:
```typescript
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeJobLog, SequelizeRequestLog, SequelizeDBLog } from "nestjs-monitoring";

export const sequelizeModule = () => SequelizeModule.forRoot({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    // ...
    models: [
        // add models here
        SequelizeRequestLog,
        SequelizeJobLog,
        SequelizeDBLog,
        // ...
    ],
    // ...
});
```

## Save Job Logs Manually:

You can create your own job for background operations:
```typescript
import { SequelizeMonitoringJobService } from 'nestjs-monitoring';

@Injectable()
export class AuthenticationService {
    constructor(private mentoringJobService: SequelizeMonitoringJobService) {}

    async sendVerificationCode(): Promise<void> {
        const number = "+1xxxxxxxxx";
        const code = "111111";
        try {
            await this.smsService.sendMessage(
                number,
                `Your verification code is: ${code}`,
            );
        } catch (error) {
            // add log for sending sms error
            this.mentoringJobService.create({
                name: "send-SMS",
                success: false,
                metadata: [
                    { number, code, datetime: new Date().toISOString() },
                    { error },
                ],
            });
        }
    }
}
```
Create Job params:

```typescript
interface ICreateJob {
    name: string; // tag of job
    success?: boolean; // default is true
    metadata: object[]; // array of results
};
```
## Clear Logs:
Logs take up a lot of storage space in a database, so you have to clear logs every period of time:

```typescript
import { SequelizeMonitoringJobService } from "nestjs-monitoring";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class LogsCronJob {
  constructor(private monitoringJobService: SequelizeMonitoringJobService) {}

  // clear logs every day
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteAllLogs(): Promise<void> {
    await this.monitoringJobService.clearAll();
  }
}
```


## Monitoring APIs:
| API  | End point  |
|:----------|:----------|
| Authentication    | {{baseUrl}}/api/monitoring/authentication    |
| Analyze Requests    | {{baseUrl}}/api/monitoring/sequelize/requests/analyze    |
| Requests Log    | {{baseUrl}}/api/monitoring/sequelize/requests    |
| Jobs Log    | {{baseUrl}}/api/monitoring/sequelize/jobs    |
| Database Queries Log    | {{baseUrl}}/api/monitoring/sequelize/db-logs    |
<hr />
