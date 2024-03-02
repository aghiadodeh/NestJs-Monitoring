export interface ICreateJob {
    name: string;
    success?: boolean;
    metadata: object[];
};

export abstract class MonitoringJobService {
    public abstract create(iCreateJob: ICreateJob): Promise<any>;
    public abstract clearAll(): Promise<void>;
}