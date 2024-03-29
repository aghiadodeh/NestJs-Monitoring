import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

@Catch()
export class MonitoringExceptionFilter implements ExceptionFilter {

    catch(exception: HttpException, host: ArgumentsHost) {
        const i18n = I18nContext.current(host);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? i18n?.t(`i18n.${exception.message}`).replace("i18n.", "") ?? exception.message : exception['message'] ?? 'Internal server error';
        
        if (!(exception instanceof HttpException) && exception['stack']) {
            try {
                const stack = exception['stack'];
                response['stack'] = stack;
                console.log(stack);
            } catch (_) {}
        }

        response.status(statusCode).json({
            statusCode,
            data: null,
            message,
            success: false,
            error: exception.cause ?? undefined,
        });
    }
}