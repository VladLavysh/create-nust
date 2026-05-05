import { Injectable, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'

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

  async create(email: string, hashedPassword: string): Promise<User> {
    const existing = await this.findByEmail(email)

    if (existing) {
      throw new ConflictException('Email already in use')
    }

    const user = this.userRepository.create({ email, password: hashedPassword })

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
