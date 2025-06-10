import {Body, Controller, Get, Headers, Post, Req, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from '@price-tracker/shared';
import {Request} from 'express';
import {AppService} from './app.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly appService: AppService) {}

  @Post('signup')
  @ApiOperation({summary: 'Register a new user'})
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      type: 'object',
      properties: {
        token: {type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'},
        user: {
          type: 'object',
          properties: {
            id: {type: 'string', example: '123e4567-e89b-12d3-a456-426614174000'},
            email: {type: 'string', example: 'user@example.com'},
            name: {type: 'string', example: 'John Doe'},
          },
        },
      },
    },
  })
  async signup(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const url = `${this.appService.getAuthServiceUrl()}/signup`;
    return this.appService.proxyRequest(url, req.method, body, headers);
  }

  @Post('signin')
  @ApiOperation({summary: 'Sign in an existing user'})
  @ApiResponse({
    status: 201,
    description: 'User successfully signed in',
    schema: {
      type: 'object',
      properties: {
        token: {type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'},
        user: {
          type: 'object',
          properties: {
            id: {type: 'string', example: '123e4567-e89b-12d3-a456-426614174000'},
            email: {type: 'string', example: 'user@example.com'},
            name: {type: 'string', example: 'John Doe'},
          },
        },
      },
    },
  })
  async signin(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const url = `${this.appService.getAuthServiceUrl()}/signin`;
    return this.appService.proxyRequest(url, req.method, body, headers);
  }

  @Post('service-token')
  async serviceToken(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const url = `${this.appService.getAuthServiceUrl()}/service-token`;
    return this.appService.proxyRequest(url, req.method, body, headers);
  }
}

@ApiTags('Subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({summary: 'Get all subscriptions'})
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'List of subscriptions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {type: 'string', example: '123e4567-e89b-12d3-a456-426614174000'},
          name: {type: 'string', example: 'The Product'},
          url: {type: 'string', example: 'https://example.com/product'},
          currentPrice: {type: 'number', example: 99.99},
          createdAt: {type: 'string', format: 'date-time', example: '2024-03-20T12:00:00Z'},
          updatedAt: {type: 'string', format: 'date-time', example: '2024-03-20T12:00:00Z'},
        },
      },
    },
  })
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getAllSubscriptions(@Req() req: Request, @Headers() headers: any) {
    const url = `${this.appService.getSubscriptionServiceUrl()}`;
    return this.appService.proxyRequest(url, req.method, undefined, headers);
  }

  @Post()
  @ApiOperation({summary: 'Create new subscription'})
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description: 'URL of the product to subscribe to',
          example: 'https://example.com/product',
        },
      },
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    schema: {
      type: 'object',
      properties: {
        url: {type: 'string', example: 'https://example.com/product'},
        name: {type: 'string', example: 'Product Name'},
        currentPrice: {type: 'number', example: 99.99},
      },
    },
  })
  @ApiResponse({status: 400, description: 'Invalid input data'})
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async createSubscription(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const url = `${this.appService.getSubscriptionServiceUrl()}`;
    return this.appService.proxyRequest(url, req.method, body, headers);
  }

  @Post('unsubscribe')
  @ApiOperation({summary: 'Delete subscription'})
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['productId'],
      properties: {
        url: {
          type: 'string',
          description: 'ID of the product to unsubscribe',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully unsubscribed from product',
    schema: {
      type: 'object',
      properties: {
        userId: {type: 'string', example: '123e4567-e89b-12d3-a456-426614174000'},
        productId: {type: 'string', example: '123e4567-e89b-12d3-a456-426614174000'},
        createdAt: {type: 'string', format: 'date-time', example: '2024-03-20T12:00:00Z'},
        updatedAt: {type: 'string', format: 'date-time', example: '2024-03-20T12:00:00Z'},
      },
    },
  })
  @ApiResponse({status: 401, description: 'Unauthorized'})
  @ApiResponse({status: 404, description: 'Subscription not found'})
  async deleteSubscription(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const url = `${this.appService.getSubscriptionServiceUrl()}/unsubscribe`;
    return this.appService.proxyRequest(url, req.method, body, headers);
  }
}

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly appService: AppService) {}

  @Post('fetch')
  @ApiOperation({summary: 'Fetch product'})
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: {type: 'string', example: 'https://example.com/product'},
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    schema: {
      type: 'object',
      properties: {
        name: {type: 'string', example: 'Product Name'},
        url: {type: 'string', example: 'https://example.com/product'},
        currentPrice: {type: 'number', example: 99.99},
      },
    },
  })
  async fetchProduct(@Req() req: Request, @Body() body: any, @Headers() headers: any) {
    const url = `${this.appService.getProductServiceUrl()}/fetch`;
    return this.appService.proxyRequest(url, req.method, body, headers);
  }
}
