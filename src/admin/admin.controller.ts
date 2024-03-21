import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Register a new admin' })
  @Post('/register')
  register(@Body() dto: RegisterAdminDto) {
    return this.adminService.register(dto);
  }

  @ApiOperation({ summary: 'Login a admin' })
  @Post('/login')
  login(@Body() dto: LoginAdminDto) {
    return this.adminService.login(dto);
  }
}
