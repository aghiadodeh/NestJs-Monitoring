import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MongooseLog } from '../../entites/mongoose-log.entity';
import { RequestLog } from '../../entites/request-log.entity';
import { JobLog } from '../../entites/job-log.entity';

@Injectable()
export class MongooseMonitoringDbService {
    constructor(
        @InjectModel(JobLog.name) 
        private jobLog: Model<JobLog>,
        @InjectModel(RequestLog.name) 
        private requestLog: Model<RequestLog>,
        @InjectModel(MongooseLog.name) 
        private mongooseLog: Model<MongooseLog>,
    ) {
        this.watchQueries();
    }

    protected watchQueries(): void {
        mongoose.set('debug', (collectionName, method, query, options) => {
            const collections = [
                this.mongooseLog.collection.name,
                this.requestLog.collection.name,
                this.jobLog.collection.name,
            ];
            if (!collections.includes(collectionName)) {
                if (!["createIndex"].includes(method)) {
                    this.saveQuery(collectionName, method, query, options);
                }
            }
        });
    }

    protected async saveQuery(collectionName: string, method: string, query: object, options: object): Promise<void> {
        Object.keys(options).forEach(key => options[key] === undefined ? delete options[key] : {});
        if (process.env.MONITORING_DB_LOG_ENABLED == 'true') {
            console.log(
                '\x1B[0;36mMongoose:\x1B[0m:',
                `${collectionName}.${method}(`, query, ',', options, ')',
                '\n---------------------',
            );
        }
        if (process.env.MONITORING_DB_LOG_SAVE_ENABLED == 'true') {
            this.mongooseLog.create({
                collectionName,
                method,
                query,
                options,
            });
        }
    }
}
