import { DataSource, Repository } from 'typeorm';
import { User } from './entity/users.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ where: { email } });
  }

  async createUser(partialUser: Partial<User>): Promise<User> {
    const user = this.create(partialUser);
    return this.save(user);
  }

  async findUserById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }
}
