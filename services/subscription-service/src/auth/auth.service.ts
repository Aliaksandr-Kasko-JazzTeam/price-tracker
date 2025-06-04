import {Injectable, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AuthService implements OnModuleInit {
  private serviceToken: string | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.refreshServiceToken();
  }

  async refreshServiceToken() {
    try {
      const response = await axios.post(
        `${this.configService.get('BASE_URL')}/auth/service-token`,
        {serviceName: 'subscription-service'},
        {
          headers: {
            'x-service-secret': this.configService.get('SERVICE_SECRET'),
          },
        },
      );
      this.serviceToken = response.data.token;
    } catch (error) {
      console.error('Failed to get service token:', error);
      throw error;
    }
  }

  getServiceToken() {
    if (!this.serviceToken) {
      throw new Error('Service token not initialized');
    }
    return this.serviceToken;
  }
}
