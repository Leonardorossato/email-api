import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { RegisterAdminDto } from './dto/register-admin.dto';

@Controller('admin')
@ApiTags('Admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/register')
  register(@Body() dto: RegisterAdminDto) {
    return this.adminService.register(dto);
  }
}
