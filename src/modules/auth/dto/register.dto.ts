import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Email es requerido' })
  @IsEmail({}, { message: 'Email debe ser una cadena de caracteres' })
  email: string;

  @IsNotEmpty({ message: 'Contraseña requerido' })
  @IsString({ message: 'Contraseña debe ser una cadena de caracteres' })
  password: string;
}
