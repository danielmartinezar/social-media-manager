import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity({ name: 'blacklisted_tokens' })
export class BlacklistedToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jti', unique: true })
  @Index()
  jti: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  @Index()
  expiresAt: Date;
}
