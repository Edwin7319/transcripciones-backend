import { IsNotEmpty, IsString } from 'class-validator';

export class SignInUserDto {
  @IsNotEmpty({ message: 'Usuario es un campo requerido' })
  @IsString({ message: 'Usuario debe ser una cadena de caracteres' })
  user: string;

  @IsNotEmpty({ message: 'Contraseña es un campo requerido' })
  @IsString({ message: 'Contraseña debe ser una cadena de caracteres' })
  password: string;
}
