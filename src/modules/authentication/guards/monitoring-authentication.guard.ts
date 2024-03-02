import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class MonitoringAuthenticationGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        if (process.env.MONITORING_AUTH_REQUIRED != 'true') {
            return true;
        }
        const request = context.switchToHttp().getRequest<Request>();

        if (process.env.MONITORING_APIS_ENABLED == 'false') {
            throw new NotFoundException(`Cannot GET ${request.path}`);
        }
        
        try {
            const token = this.extractTokenFromHeader(request);
            if (!token) {
                throw new UnauthorizedException();
            }
            const payload = this.jwtService.verify(
                token,
                { secret: process.env.MONITORING_JWT_SECRET }
            );

            if (!payload?.id) {
                return false;
            }
            request['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException(error);
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}