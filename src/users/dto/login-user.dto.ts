import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: '',
    description: 'The email of the User',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'The password of the User',
  })
  password: string;
}
