import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { JwtStrategy } from '../guards/jwt.strategy';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
@Module({
  controllers: [AdminController],
  providers: [
    AdminService,
    JwtStrategy,
    JwtService,
    {
      provide: 'db__client',
      useClass: PrismaClient,
    },
  ],
})
export class AdminModule {}
