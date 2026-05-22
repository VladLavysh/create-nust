import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'
import { IUser, UserRole } from '@nust/shared'

@Entity('users')
@Index(['provider', 'providerId'], { unique: true })
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  email!: string

  @Column({ nullable: true })
  password!: string | null

  @Column({ type: 'varchar', nullable: true })
  provider!: 'local' | 'google' | 'github' | null

  @Column({ nullable: true })
  providerId!: string | null

  @Column({ default: false })
  isEmailVerified!: boolean

  @Column({ default: 'user' })
  role!: UserRole

  @Column({ default: true })
  isActive!: boolean

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}
