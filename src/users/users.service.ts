import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { JwtStrategy } from '../guards/jwt.strategy';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto, UserRole } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/updade-user.dto';
import { User } from './entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService,
    private readonly nodemailerService: MailerService,
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
      await this.nodemailerService.sendMail({
        to: user.email,
        from: 'noreply@application.com',
        subject: 'Confirm your account',
        template: 'email-confirmation',
        context: {
          token: user.confirmationToken,
        },
      });
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
    return { access_token: token, id: user.id, role: user.role };
  }

  async findAll(page?: number, limit?: number, search?: string) {
    const queyPage = Number(page) < 1 ? 1 : Number(page);
    const queyLimit = Number(limit) > 10 ? 10 : Number(limit);
    const users = await this.usersRepository.find({
      where: {
        name: search?.length > 0 ? search : undefined,
      },
      skip: queyLimit * (queyPage - 1),
      take: queyLimit,
    });
    const countUsers = await this.usersRepository.count();
    return {
      users,
      total: countUsers,
      page: queyPage,
      limit: queyLimit,
    };
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { name, email, role } = dto;
    user.name = name;
    user.email = email;
    user.role = role ? role : user.role;
    try {
      await this.usersRepository.update(id, user);
      return {
        message: 'User updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      await this.usersRepository.remove(user);
      return {
        message: 'User removed successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException('Error removing user');
    }
  }
}
