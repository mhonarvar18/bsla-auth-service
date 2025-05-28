import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern('signup')
  signup(body: { email: string; password: string }) {
    return this.authService.signup(body.email, body.password);
  }

  @MessagePattern('login')
  login(body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @MessagePattern('verify-token')
  getProfile(@Payload() data: { token: string }) {
    return this.authService.verifyToken(data.token);
  }
}
