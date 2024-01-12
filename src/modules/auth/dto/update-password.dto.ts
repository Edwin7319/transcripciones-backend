import { IsNotEmpty, IsString, Matches } from 'class-validator';

import { REGEX_EMAIL } from '../../../constants/constants';

export class UpdatePasswordDto {
  @IsNotEmpty()
  @Matches(REGEX_EMAIL)
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}

export class RecoverPasswordDto {
  @IsNotEmpty()
  @Matches(REGEX_EMAIL)
  email: string;
}
