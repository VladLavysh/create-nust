import { UserRole } from '../enums/role.enum'

export interface IUser {
  id: string
  email: string
  password: string
  isEmailVerified: boolean
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IAuthTokens {
  accessToken: string
  refreshToken: string
}
