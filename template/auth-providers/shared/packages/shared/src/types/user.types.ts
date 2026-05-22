import { UserRole } from "../enums/role.enum";

export type AuthProviderType = "local" | "google" | "github";

export interface IUser {
  id: string;
  email: string;
  password: string | null;
  provider: AuthProviderType | null;
  providerId: string | null;
  isEmailVerified: boolean;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserPublic = Omit<IUser, "password">;

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}
