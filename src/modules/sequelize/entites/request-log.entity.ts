import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "monitoring_request_logs" })
export class SequelizeRequestLog extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @Column({ type: DataType.STRING })
  key: string;

  @Column({ type: DataType.STRING })
  url: string;

  @Column({ type: DataType.STRING })
  method: string;

  @Column({ type: DataType.JSON })
  user: any;

  @Column({ type: DataType.JSON })
  request: any;

  @Column({ type: DataType.JSON })
  response: any;

  @Column({ type: DataType.JSON })
  responseHeaders: any;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  success: boolean;

  @Column({ type: DataType.DOUBLE })
  duration: number;
}
