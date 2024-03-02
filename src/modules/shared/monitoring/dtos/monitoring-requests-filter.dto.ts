import { IsOptional } from "class-validator";
import { MonitoringBaseFilterDto } from "./base-filter.dto";

export class MonitoringRequestFilterDto extends MonitoringBaseFilterDto {
    @IsOptional()
    url: string;

    @IsOptional()
    method: string;

    @IsOptional()
    exception: string;

    @IsOptional()
    success: string;

    @IsOptional()
    user: string;
}