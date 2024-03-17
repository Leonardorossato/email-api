import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterUserDto, UserRole } from './dto/register-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async register(dto: RegisterUserDto) {
    const { name, email, password } = dto;
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.role = user.role || UserRole.USER;
    user.status = true;
    user.confirmationToken = crypto.randomBytes(32).toString('hex');

    try {
      const newUser = await this.usersRepository.save(user);
      return newUser;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async login() {
    return 'login';
  }
}
