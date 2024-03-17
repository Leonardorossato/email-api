import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forRootAsync(typeOrmConfig), UsersModule, AdminModule],
})
export class AppModule {}
