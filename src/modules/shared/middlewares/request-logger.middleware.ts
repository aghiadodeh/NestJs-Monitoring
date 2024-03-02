import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';

@Injectable()
export abstract class BaseRequestLoggerMiddleware implements NestMiddleware {

    use(request: Request, response: Response, next: NextFunction) {
        this.saveLog(request, response);
        next();
    }

    abstract create(data: any): Promise<void>;

    protected async saveLog(req: Request, res: Response): Promise<void> {
        if (req.originalUrl.includes('monitoring/')) return;
        
        const request = {
            ip: req.ip,
            headers: req.headers,
            url: req.originalUrl,
            method: req.method,
            params: req.params,
            queries: req.query,
            body: req.body,
            datetime: moment().toISOString(),
            date: new Date(),
        };

        const response = {
            ...(await this.getResponse(res)).body,
            datetime: moment().toISOString(),
        };


        const diff = moment(new Date()).diff(request.date, 'milliseconds');
        const duration = moment.duration(diff, 'milliseconds');
        delete request.date;

        if (req['res'] && req['res']['stack']) {
            response['exception'] = req['res']['stack'];
        }

        if (req['user']) {
            request['user'] = req['user'];
        }

        this.create({
            key: 'apis-traffic',
            url: request.url,
            method: request.method,
            request,
            response,
            responseHeaders: res.getHeaders(),
            success: response.success,
            duration: duration.asMilliseconds(),
        });
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
                    res.once('drain', res.write);
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
                const body = Buffer.concat(chunkBuffers).toString('utf8');
                let json = body || {};
                try {
                    json = JSON.parse(body);
                } catch (_) { }
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