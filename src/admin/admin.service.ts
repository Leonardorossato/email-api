import { MailerService } from '@nestjs-modules/mailer';
import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as path from 'path';
import { JwtStrategy } from '../guards/jwt.strategy';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject('db__client')
    private readonly dbClient: PrismaClient,
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}

  private readonly adminRepository = this.dbClient.users;

  async register(dto: RegisterAdminDto) {
    const { name, email, password, role } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const userAdminCreated = await this.adminRepository.create({
      data: {
        ...dto,
        password: hashedPassword,
        role: role || UserRole.ADMIN,
        confirmationToken: confirmationToken,
        recoverToken: null,
      },
    });
    await this.mailService.sendMail({
      to: email,
      from: 'noreply@application.com',
      subject: 'Confirm your account',
      template: 'email-confirmation',
      context: {
        token: confirmationToken,
      },
    });
    if (dto.password !== dto.passwordConfirmation) {
      throw new UnprocessableEntityException(
        'Password confirmation is incorrect',
      );
    }
    return userAdminCreated;
  }

  async login(dto: LoginAdminDto) {
    const { email, password } = dto;
    const admin = await this.adminRepository.findFirst({
      where: { email: email },
    });
    if (!admin) {
      throw new UnprocessableEntityException('Email not found');
    }
    if (admin == null) {
      throw new UnprocessableEntityException('Credentials not valid');
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnprocessableEntityException('Passwords not match');
    }
    const payload = await this.jwtStrategy.validateAdmin({
      id: admin.id,
      role: admin.role,
    });
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
    return {
      access_token: token,
      id: admin.id,
    };
  }
}
