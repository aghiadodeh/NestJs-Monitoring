import { IsOptional } from "class-validator";
import { MonitoringBaseFilterDto } from "./base-filter.dto";

export class MonitoringJobFilterDto extends MonitoringBaseFilterDto {
    @IsOptional()
    name: string;

    @IsOptional()
    success: 'true' | 'false';
}