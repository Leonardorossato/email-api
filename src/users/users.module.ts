import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { JwtStrategy } from '../guards/jwt.strategy';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  MAILER_OPTIONS,
  MailerModule,
  MailerService,
} from '@nestjs-modules/mailer';
import { mailerConfig } from 'src/config/mailer.config';
import { environment } from '../env/envoriment';
@Module({
  imports: [MailerModule.forRoot(mailerConfig)],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtStrategy,
    JwtService,
    MailerService,
    {
      provide: 'dbclient',
      useClass: PrismaClient,
    },
    {
      provide: MAILER_OPTIONS,
      useValue: {
        transport: {
          host: environment.NODEMAILER_HOST,
          port: Number(environment.NODEMAILER_PORT),
          secure: false,
          auth: {
            user: environment.NODEMAILER_USER,
            pass: environment.NODEMAILER_PASS,
          },
        },
      },
    },
  ],
})
export class UsersModule {}
