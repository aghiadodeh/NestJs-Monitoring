import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class MonitoringAuthenticationService {
    constructor(private jwtService: JwtService) { }

    public login(loginDto: LoginDto): string {
        if (loginDto.username == process.env.MONITORING_USERNAME && loginDto.password == process.env.MONITORING_PASSWORD) {
            return this.generateJwt({ id: `${loginDto.username}-${new Date().toISOString()}` });
        }
        throw new BadRequestException('wrong_credentials');
    }

    public generateJwt(payload: any): string {
        return this.jwtService.sign(
            payload,
            {
                secret: process.env.MONITORING_JWT_SECRET,
                expiresIn: '10h',
            },
        );
    }
}
