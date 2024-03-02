import { IsOptional } from "class-validator";
import { MonitoringBaseFilterDto } from "./base-filter.dto";

export class MonitoringSequelizeFilterDto extends MonitoringBaseFilterDto {
    @IsOptional()
    tableName: string;
}