export class JwtPayloadDto {
  id: number;
  name: string;
  surname: string;
  email: string;
  roles: Array<any>;
  iat?: Date;
}
