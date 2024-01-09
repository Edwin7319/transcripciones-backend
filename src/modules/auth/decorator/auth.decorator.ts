import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolGuard } from '../guard/rol.guard';

import { Roles, RolesType } from './rol.decorator';

export const Auth = (...roles: RolesType[]) =>
  applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolGuard),
    ApiBearerAuth(),
  );
