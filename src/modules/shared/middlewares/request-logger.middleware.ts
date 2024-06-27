import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import moment from "moment-timezone";

@Injectable()
export abstract class BaseRequestLoggerMiddleware implements NestMiddleware {
  constructor() {}

  use(request: Request, response: Response, next: NextFunction) {
    this.saveLog(request, response);
    next();
  }

  abstract create(data: any): Promise<void>;

  protected async saveLog(req: Request, res: Response): Promise<void> {
    try {
      if (req.originalUrl.includes("monitoring/")) return;

      const now = new Date();
      let body = req.body;
      if (!req.headers["cache-control"]) {
        req.headers["cache-control"] = "no-cache";
      }

      const response = {
        ...(await this.getResponse(res)).body,
        datetime: moment().toISOString(),
      };

      const contentType = res.getHeader("content-type");
      if (!contentType?.toString()?.includes("json")) {
        return;
      }

      try {
        if (req.headers["content-type"]?.toLocaleLowerCase().includes("multipart/form-data")) {
          body = res["req"].body;
        }
      } catch (error) {
        console.error("BaseRequestLoggerMiddleware", error);
      }

      const request = {
        ip: req.ip,
        headers: req.headers,
        url: req.originalUrl,
        method: req.method,
        params: req.params,
        queries: req.query,
        body: body,
        datetime: now,
        date: now,
      };

      const diff = moment(new Date()).diff(request.date, "milliseconds");
      const duration = moment.duration(diff, "milliseconds");
      delete request.date;

      if (req["res"] && req["res"]["stack"]) {
        response["exception"] = req["res"]["stack"];
      }

      if (req["user"]) {
        request["user"] = req["user"];
      }

      if (process.env.MONITORING_REQUEST_LOG_ENABLED == "true") {
        try {
          console.log(
            `\x1B[0;36mRequest:\x1B[0m\n`,
            `\x1B[0;34mAPI:\x1B[0m ${request.method} - ${request.url}\n`,
            `\x1B[0;30mDate:\x1B[0m ${now}\n`,
            `\x1B[0;33mBody:\x1B[0m ${JSON.stringify(request.body)}\n`,
            `\x1B[0;35mQueries:\x1B[0m ${JSON.stringify(request.queries)}\n`,
            response.success == false
              ? `\x1B[0;31mResponse:\x1B[0m "${response.message}"\n`
              : `\x1B[0;32mResponse:\x1B[0m "${response.message}"\n`,
            "---------------------",
          );
        } catch (_) {}
      }

      await this.create({
        key: "apis-traffic",
        url: request.url,
        method: request.method,
        request,
        response,
        responseHeaders: res.getHeaders(),
        success: response.success,
        duration: duration.asMilliseconds(),
        createdAt: new Date(),
      });
    } catch (error) {}
  }

  protected getResponse = (res: Response): Promise<any> => {
    const rawResponse = res.write;
    const rawResponseEnd = res.end;
    const chunkBuffers = [];
    res.write = (...chunks: any[]) => {
      const resArgs = [];
      for (let i = 0; i < chunks.length; i++) {
        resArgs[i] = chunks[i];
        if (!resArgs[i]) {
          res.once("drain", res.write);
          i--;
        }
      }
      if (resArgs[0]) {
        chunkBuffers.push(Buffer.from(resArgs[0]));
      }
      return rawResponse.apply(res, resArgs as any);
    };
    return new Promise((resolve) => {
      res.end = (...chunk: any[]) => {
        const resArgs = [];
        for (let i = 0; i < chunk.length; i++) {
          resArgs[i] = chunk[i];
        }
        if (resArgs[0]) {
          chunkBuffers.push(Buffer.from(resArgs[0]));
        }
        const body = Buffer.concat(chunkBuffers).toString("utf8");
        let json = body || {};
        try {
          json = JSON.parse(body);
        } catch (_) {}
        const responseLog = {
          statusCode: res.statusCode,
          body: json,
          // Returns a shallow copy of the current outgoing headers
          headers: res.getHeaders(),
        };
        rawResponseEnd.apply(res, resArgs as any);
        resolve(responseLog);
        return responseLog as unknown as Response;
      };
    });
  };
}
