import { IsOptional } from "class-validator";
import { MonitoringBaseFilterDto } from "./base-filter.dto";

export class MonitoringMongoFilterDto extends MonitoringBaseFilterDto {
    @IsOptional()
    collectionName: string;

    @IsOptional()
    method: string;
}