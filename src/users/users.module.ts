import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '../guards/jwt.strategy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtService, {
    provide: 'db__client',
    useClass: PrismaClient
  }],
})
export class UsersModule {}
