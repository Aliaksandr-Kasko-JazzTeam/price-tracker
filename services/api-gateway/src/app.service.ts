import {HttpException, Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {HttpService} from '@nestjs/axios';
import {AxiosError} from 'axios';
import {firstValueFrom} from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  getAuthServiceUrl() {
    return this.configService.get('AUTH_SERVICE_URL', 'http://localhost:3001');
  }

  getSubscriptionServiceUrl() {
    return this.configService.get('SUBSCRIPTION_SERVICE_URL', 'http://localhost:3002');
  }

  getProductServiceUrl() {
    return this.configService.get('PRODUCT_SERVICE_URL', 'http://localhost:3003');
  }

  async proxyRequest(url: string, method: string, body?: any, headers?: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data: body,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        }),
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;

          if (status === 401) {
            throw new UnauthorizedException(data?.message || 'Authentication required');
          }

          throw new HttpException(
            data?.message || data || 'Internal server error',
            status
          );
        }

        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          throw new HttpException('Service unavailable', 503);
        }
      }

      console.error('Unexpected error in proxyRequest:', error);
      throw new HttpException('Internal server error', 500);
    }
  }
}
