export interface MonitoringListResponse<T> {
  total: number;
  data: T[];
  metadata?: any;
}
