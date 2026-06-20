import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../shared/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./login.dto";
import { ForgotPasswordDto, ResetPasswordDto } from "./password-reset.dto";

type AuthenticatedRequest = {
  user: { sub: string; email: string; role: string; name: string };
};

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post("forgot-password")
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post("reset-password")
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthenticatedRequest) {
    return this.auth.currentUser(req.user.sub);
  }
}
