import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class AppService {
  constructor(
    private _health: HealthCheckService,
    private _http: HttpHealthIndicator
  ) {}

  @HealthCheck()
  async getHealthCheck(): Promise<HealthCheckResult> {
    const checks = await this._health.check([
      () => this._http.pingCheck('ping', 'https://www.google.com'),
    ]);
    if (checks.status !== 'ok') {
      throw new HttpException('Gone', HttpStatus.GONE);
    }
    return checks;
  }
}
