import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { SequelizeDBLog } from "../../entites/sequelize-log.entity";

@Injectable()
export class SequelizeMonitoringDbService {
  private readonly logger = new Logger("MonitoringDbService");

  constructor(
    private sequelize: Sequelize,
    @InjectModel(SequelizeDBLog) private dbLog: typeof SequelizeDBLog,
  ) {
    this.watchQueries();
  }

  protected watchQueries(): void {
    this.sequelize.options.logging = async (sql: string, timing: any) => {
      const options = { ...timing };
      const tables = ["`monitoring_request_logs`", "`monitoring_job_logs`", "`monitoring_db_logs`"];
      if (!tables.find((e) => sql.includes(e))) {
        if (process.env.MONITORING_DB_LOG_ENABLED == "true") {
          console.log("\x1B[0;36mSequelize:\x1B[0m:", sql, "\n---------------------");
        }

        if (process.env.MONITORING_DB_LOG_SAVE_ENABLED == "true") {
          try {
            if (options) {
              if (options.include && Array.isArray(options.include)) {
                options.include = options.include.map((e: any) => {
                  const { model, attributes, as } = e;
                  return { model, attributes, as };
                });
              }
              delete options["logging"];
              delete options["includeMap"];
            }
            Object.keys(options).forEach((key) =>
              options[key] === undefined ? delete options[key] : {},
            );
            let table: string = null;
            try {
              delete options.password;
              if (Array.isArray(timing.tableNames)) {
                if (timing.tableNames.length == 1) {
                  table = timing.tableNames[0];
                } else {
                  table = timing.tableNames.find((e: string) => !timing.includeNames?.includes(e));
                }
              }
            } catch (_) {}

            await this.dbLog.create({ query: { sql }, details: options, table });
          } catch (error) {
            this.logger.error(error);
          }
        }
      }
    };
  }
}
