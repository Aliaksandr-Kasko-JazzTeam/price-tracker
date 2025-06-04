import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClientProxy, ClientProxyFactory, Transport} from '@nestjs/microservices';
import {IPriceChangeNotification} from "@price-tracker/shared";
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly client: ClientProxy;
  private readonly sender: Mail.Address;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });

    this.sender = {
      name: 'Price Tracker',
      address: this.configService.get<string>('SMTP_FROM')!
    }

    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL')!],
        queue: 'price-change-notifications',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async handlePriceChange(notification: IPriceChangeNotification) {
    try {
      const {subscribers, productName, productUrl, currentPrice, previousPrice} = notification;

      const {subject, html} = this.generateEmailContent({
        productName,
        productUrl,
        currentPrice,
        previousPrice,
      });


      const mailOptions: nodemailer.SendMailOptions = {
        from: this.sender,
        to: this.sender,
        bcc: subscribers,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Notification sent to ${subscribers.length} subscriber(s)`);
    } catch (error) {
      this.logger.error('Failed to send notification', error);
      throw error;
    }
  }

  private generateEmailContent(
    {productName, productUrl, currentPrice, previousPrice}: Omit<IPriceChangeNotification, 'subscribers'>
  ) {
    if (currentPrice === -1) {
      return {
        subject: `Product Unavailable: ${productName}`,
        html: `
          <h2>Product Unavailable Alert</h2>
          <p>The product <strong>${productName}</strong> is currently unavailable.</p>
          <p>Previous price: $${previousPrice.toFixed(2)}</p>
        `,
      };
    }

    if (previousPrice === -1) {
      return {
        subject: `Product Available Again: ${productName}`,
        html: `
          <h2>Product Available Alert</h2>
          <p>Great news! The product <strong>${productName}</strong> is back in stock!</p>
          <p>Current price: $${currentPrice.toFixed(2)}</p>
          <p>View the product: <a href="${productUrl}">Click here</a></p>
        `,
      };
    }

    const priceChange = currentPrice - previousPrice;
    const priceChangePercentage = ((priceChange / previousPrice) * 100).toFixed(2);
    const direction = priceChange > 0 ? 'increased' : 'decreased';

    return {
      subject: `Price Alert: ${productName}`,
      html: `
        <h2>Price Change Alert</h2>
        <p>The price of <strong>${productName}</strong> has ${direction}.</p>
        <p>Previous price: $${previousPrice.toFixed(2)}</p>
        <p>Current price: $${currentPrice.toFixed(2)}</p>
        <p>Change: ${priceChangePercentage}%</p>
        <p>View the product: <a href="${productUrl}">Click here</a></p>
      `,
    };
  }
}
