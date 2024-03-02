import { Module } from '@nestjs/common';
import { MongooseAnalyzeService } from './mongoose-analyze.service';
import { MongooseAnalyzeController } from './mongoose-analyze.controller';

@Module({
  controllers: [MongooseAnalyzeController],
  providers: [MongooseAnalyzeService],
})
export class MongooseAnalyzeModule {}
