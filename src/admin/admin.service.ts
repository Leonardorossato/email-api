import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly adminRepository: Repository<User>,
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
      return await this.adminRepository.save(admin);
    }
  }
}
