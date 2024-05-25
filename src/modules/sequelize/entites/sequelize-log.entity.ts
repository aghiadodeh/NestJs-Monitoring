import { Table, Column, Model, DataType } from "sequelize-typescript";

@Table({ tableName: "monitoring_db_logs" })
export class SequelizeDBLog extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id: string;

  @Column({ type: DataType.STRING })
  table: string;

  @Column({ type: DataType.JSON, allowNull: false })
  query: any;

  @Column({ type: DataType.JSON })
  details: any;
}
