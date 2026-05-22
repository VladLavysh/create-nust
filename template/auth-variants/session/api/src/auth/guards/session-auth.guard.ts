import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as { userId?: string } | undefined;
    const userId = session?.userId;

    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.validateUserById(userId);
    (request as Request & { user: unknown }).user = user;
    return true;
  }
}
