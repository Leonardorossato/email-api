import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterUserDto, UserRole } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../guards/jwt.strategy';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService,
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

  async login(dto: LoginUserDto) {
    const { email, password } = dto;
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new ConflictException('Email not found');
    }
    if (user == null) {
      throw new UnauthorizedException('Credentials not valid');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException('Passwords not match');
    }
    const payload = await this.jwtStrategy.validate(user);
    const token = await this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
    return { access_token: token };
  }

  async findAll() {
    const users = await this.usersRepository.find({
      where: {
        role: UserRole.USER,
      }
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({id});
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
