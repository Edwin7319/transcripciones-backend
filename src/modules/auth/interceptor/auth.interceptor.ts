import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements NestInterceptor {
  constructor(
    private _jwtService: JwtService,
    private readonly _configService: ConfigService
  ) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const publicRoutes = ['reproducir', 'auth'];
    const isLoginRoute = publicRoutes.some((route) =>
      request.path.includes(route)
    );

    if (isLoginRoute) {
      return next.handle();
    }

    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException({
        message: 'No autorizado',
      });
    }

    try {
      request.user = this._jwtService.verify(token, {
        secret: this._configService.get('jwt.secretKey'),
      });
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Sesión caducada',
      });
    }

    return next.handle();
  }
}
