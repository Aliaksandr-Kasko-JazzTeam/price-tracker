import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios from 'axios';
import {AuthService} from "../auth/auth.service";

@Injectable()
export class ProductClientService {
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL')!;
  }

  async fetchAndCreateProduct(url: string) {
    const response = await axios.post(
      `${this.baseUrl}/products/fetch`,
      {url},
      {headers: {Authorization: `Bearer ${this.authService.getServiceToken()}`}}
    );
    return response.data;
  }
}
