import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import type { IUserPublic } from "@nust/shared";
import { AuthService, type AppSession } from "./auth.service";
import { SessionAuthGuard } from "./guards/session-auth.guard";
import { CurrentUser } from "@api/common/decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { User } from "@api/users/user.entity";
// __OAUTH_CONTROLLER_IMPORTS__

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
  ): Promise<IUserPublic> {
    return this.authService.register(
      dto.email,
      dto.password,
      req.session as AppSession,
    );
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<IUserPublic> {
    return this.authService.login(
      dto.email,
      dto.password,
      req.session as AppSession,
    );
  }

  @Get("me")
  @UseGuards(SessionAuthGuard)
  async getMe(@CurrentUser() user: User): Promise<IUserPublic> {
    return this.authService.sanitizeUser(user);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request): Promise<{ ok: true }> {
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err: Error | undefined) => {
        if (err) reject(err);
        else resolve();
      });
    });
    return { ok: true };
  }

  // __OAUTH_CONTROLLER_ROUTES__
}
