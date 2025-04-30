import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entity/users.entity';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'amount' })
  amount: number;

  @Column({ name: 'description', nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;
}
