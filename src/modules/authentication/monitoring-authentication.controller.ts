import { Body, Controller, Post } from "@nestjs/common";
import { MonitoringAuthenticationService } from "./monitoring-authentication.service";
import { LoginDto } from "./dto/login.dto";

@Controller({ path: "monitoring/authentication", version: '' })
export class MonitoringAuthenticationController {
  constructor(private readonly authenticationService: MonitoringAuthenticationService) { }

  @Post("login")
  login(@Body() loginDto: LoginDto): string {
    return this.authenticationService.login(loginDto);
  }
}
