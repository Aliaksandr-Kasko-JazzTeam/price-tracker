import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClientProxy, ClientProxyFactory, RmqOptions, Transport} from '@nestjs/microservices';
import {IPriceCheckMessage} from "@price-tracker/shared";
import {lastValueFrom} from 'rxjs';

@Injectable()
export class MessageBrokerService {
  private readonly logger = new Logger(MessageBrokerService.name);
  private readonly client: ClientProxy;

  constructor(private readonly configService: ConfigService) {
    let clientOptions: RmqOptions = {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get('RABBITMQ_URL', 'amqp://localhost:5672')] as string[],
        queue: 'price-check-queue',
        queueOptions: {
          durable: true,
          messageTtl: 30 * 60 * 1000,
        },
      },
    };
    this.client = ClientProxyFactory.create(clientOptions);
  }

  async publishPriceCheckRequest(message: IPriceCheckMessage): Promise<void> {
    try {
      await lastValueFrom(this.client.emit('price-check', message));
      this.logger.debug(`Published price check request for ${message.url}`);
    } catch (error) {
      this.logger.error(`Error publishing price check request for ${message.url}:`, error);
      throw error;
    }
  }
}
