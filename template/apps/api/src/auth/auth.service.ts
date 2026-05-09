import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'

export interface JwtPayload {
  sub: string
  email: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string): Promise<AuthTokens> {
    const hashedPassword = await bcrypt.hash(password, +this.configService.get('BCRYPT_SALT_ROUNDS'))
    const user = await this.usersService.create(email, hashedPassword)

    return this.generateTokens(user)
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.generateTokens(user)
  }

  async validateUserById(id: string): Promise<User> {
    const user = await this.usersService.findById(id)

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }

  private generateTokens(user: User): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    })

    return { accessToken, refreshToken }
  }
}