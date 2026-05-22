import { Injectable, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

export interface OAuthProfileInput {
  email: string
  provider: 'google' | 'github'
  providerId: string
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } })
  }

  async findByProvider(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({ where: { provider, providerId } })
  }

  async findOrCreateFromOAuth(input: OAuthProfileInput): Promise<User> {
    const existing = await this.findByProvider(input.provider, input.providerId)
    if (existing) return existing

    const byEmail = await this.findByEmail(input.email)
    if (byEmail) {
      throw new ConflictException(
        'An account with this email already exists. Sign in with your password.',
      )
    }

    const user = this.userRepository.create({
      email: input.email,
      provider: input.provider,
      providerId: input.providerId,
      password: null,
    })

    return this.userRepository.save(user)
  }

  async create(email: string, hashedPassword: string): Promise<User> {
    const existing = await this.findByEmail(email)

    if (existing) {
      throw new ConflictException('Email already in use')
    }

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      provider: 'local',
    })

    return this.userRepository.save(user)
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    Object.assign(user, updates)

    return this.userRepository.save(user)
  }
}
