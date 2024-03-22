import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UsersModule,
    AdminModule,
  ],
})
export class AppModule {}
