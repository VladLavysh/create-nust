import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "@api/users/users.module";
// __OAUTH_IMPORTS__

@Module({
  imports: [
    UsersModule,
    // __OAUTH_MODULE_IMPORTS__
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // __OAUTH_PROVIDERS__
  ],
})
export class AuthModule {}
