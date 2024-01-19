import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import { REGEX_EMAIL } from '../../../constants/constants';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  institution: string;

  @IsNotEmpty()
  @Matches(REGEX_EMAIL)
  email: string;

  @IsNotEmpty()
  @IsArray()
  roles: Array<string>;
}
