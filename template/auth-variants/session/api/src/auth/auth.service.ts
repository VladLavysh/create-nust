import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import type { Session } from "express-session";
import type { IUserPublic } from "@nust/shared";
import { UsersService } from "@api/users/users.service";
import { User } from "@api/users/user.entity";

/** Session store with fields set at login/register. */
export type AppSession = Session & {
  userId?: string;
  email?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async register(
    email: string,
    password: string,
    session: AppSession,
  ): Promise<IUserPublic> {
    const hashedPassword = await bcrypt.hash(
      password,
      +this.configService.get("BCRYPT_SALT_ROUNDS"),
    );
    const user = await this.usersService.create(email, hashedPassword);

    this.setSessionUser(session, user);
    return this.sanitizeUser(user);
  }

  async login(
    email: string,
    password: string,
    session: AppSession,
  ): Promise<IUserPublic> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    this.setSessionUser(session, user);
    return this.sanitizeUser(user);
  }

  async validateUserById(id: string): Promise<User> {
    const user = await this.usersService.findById(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  sanitizeUser(user: User): IUserPublic {
    const { password, ...result } = user;
    return result;
  }

  private setSessionUser(session: AppSession, user: User): void {
    session.userId = user.id;
    session.email = user.email;
  }
}
