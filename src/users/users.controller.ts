import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto, UserRole } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Role } from '../guards/role.guard';
import { RolesGuard } from '../guards/role.strategy';
import { JwtAuthGuard } from '../guards/jwt.guard';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('/register')
  register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @ApiOperation({ summary: 'Login a user' })
  @Post('/login')
  login(@Body() dto: LoginUserDto) {
    return this.usersService.login(dto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @Role(UserRole.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('')
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @Role(UserRole.ADMIN)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
