import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { User } from './entity/users.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Find a user by their email address.
   * @param email - The email of the user.
   * @returns The User entity or null if not found.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    return user;
  }

  /**
   * Find a user by their unique identifier.
   * @param id - The primary key of the user.
   * @returns The User entity or null if not found.
   */
  async findUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  /**
   * Create a new user with hashed password.
   * @param userDto - Data transfer object containing new user properties.
   * @returns The newly created User entity.
   */
  async createUser(userDto: CreateUserDto): Promise<User> {
    // Instantiate user entity and copy properties
    const user = new User();
    Object.assign(user, userDto);

    // Generate salt and hash the password before saving
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    user.password = await bcrypt.hash(user.password, salt);

    // Persist the user entity via the repository
    return this.userRepository.createUser(user);
  }
}
