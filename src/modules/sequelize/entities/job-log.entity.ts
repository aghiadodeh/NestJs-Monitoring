import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "monitoring_job_logs" })
export class SequelizeJobLog extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  success: boolean;

  @Column({ type: DataType.JSON, allowNull: false })
  metadata: any[];
}
