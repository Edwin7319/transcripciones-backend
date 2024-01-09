import { IsArray, IsNotEmpty, IsString, Matches } from 'class-validator';

import { REGEX_EMAIL } from '../../../constants/constants';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @Matches(REGEX_EMAIL)
  email: string;

  @IsNotEmpty()
  @IsArray()
  roles: Array<string>;
}
