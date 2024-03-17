import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserRole } from '../../users/dto/register-user.dto';

export class RegisterAdminDto {
  @ApiProperty({
    example: 'Jhon Doe',
    description: 'The name of the User',
  })
  name: string;

  @ApiProperty({
    example: 'jhondev@gmail.com',
    description: 'The email of the User',
  })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The password of the User',
  })
  password: string;

  @ApiProperty({
    example: '123456',
    description: 'The password confirmation of the User',
  })
  @IsOptional()
  passwordConfirmation?: string;

  role?: UserRole;
}
