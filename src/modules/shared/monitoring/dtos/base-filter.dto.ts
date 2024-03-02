import { IsOptional } from "class-validator";

export class MonitoringBaseFilterDto {
  @IsOptional()
  page?: string;

  @IsOptional()
  per_page?: string;

  @IsOptional()
  pagination?: "true" | "false";

  @IsOptional()
  sortKey?: string;

  @IsOptional()
  sortDir?: "ASC" | "DESC";

  @IsOptional()
  fromDate: string;

  @IsOptional()
  toDate: string;
}
