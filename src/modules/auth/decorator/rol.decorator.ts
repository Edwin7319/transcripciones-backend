import { CustomDecorator, SetMetadata } from '@nestjs/common';

export type RolesType = 'ADMIN' | 'VISITADOR';

export const Roles = (...roles: RolesType[]): CustomDecorator<string> =>
  SetMetadata('roles', roles);
