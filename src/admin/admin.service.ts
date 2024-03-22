import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { UserRole } from '../users/dto/register-user.dto';
import { User } from '../users/entities/user.entity';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { JwtStrategy } from '../guards/jwt.strategy';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly adminRepository: Repository<User>,
    private readonly jwtStrategy: JwtStrategy,
    private readonly jwtService: JwtService,
    private readonly nodemailerService: MailerService,
  ) {}
  async register(dto: RegisterAdminDto) {
    const { name, email, password } = dto;
    const admin = new User();
    admin.name = name;
    admin.email = email;
    admin.password = await bcrypt.hash(password, 10);
    admin.role = admin.role || UserRole.ADMIN;
    admin.status = true;
    admin.confirmationToken = crypto.randomBytes(32).toString('hex');
    if (dto.password !== dto.passwordConfirmation) {
      throw new UnprocessableEntityException(
        'Password confirmation is incorrect',
      );
    } else {
      await this.nodemailerService.sendMail({
        to: admin.email,
        from: 'noreply@application.com',
        subject: 'Confirm your account',
        template: 'email-confirmation',
        context: {
          token: admin.confirmationToken,
        },
      });
      return await this.adminRepository.save(admin);
    }
  }

  async login(dto: LoginAdminDto) {
    const { email, password } = dto;
    const admin = await this.adminRepository.findOneBy({ email });
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
    const payload = await this.jwtStrategy.validateAdmin(admin);
    const token = await this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    });
    return {
      access_token: token,
      id: admin.id,
      confirmationToken: admin.confirmationToken,
    };
  }
}
