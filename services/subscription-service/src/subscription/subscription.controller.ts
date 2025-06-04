import {Body, Controller, Get, Post, Request, Res, UnauthorizedException, UseFilters, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {JwtAuthGuard} from '@price-tracker/shared';
import {Response} from 'express';
import {UnauthorizedExceptionFilter} from '../filters/unauthorized-exception.filter';
import {SubscriptionService} from './subscription.service';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('Subscriptions')
@Controller()
@UseGuards(JwtAuthGuard)
@UseFilters(UnauthorizedExceptionFilter)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({summary: 'Get user subscriptions'})
  @ApiResponse({
    status: 200,
    description: 'List of user subscriptions',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {type: 'string', example: '123e4567-e89b-12d3-a456-426614174000'},
          url: {type: 'string', example: 'https://example.com/product'},
          name: {type: 'string', example: 'Product Name'},
          currentPrice: {type: 'number', example: 99.99},
          createdAt: {type: 'string', format: 'date-time', example: '2024-03-20T12:00:00Z'},
          updatedAt: {type: 'string', format: 'date-time', example: '2024-03-20T12:00:00Z'},
        },
      },
    },
  })
  @ApiResponse({status: 401, description: 'Unauthorized'})
  async getUserSubscriptions(@Request() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.subscriptionService.getUserSubscriptions(req.user.userId);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({summary: 'Subscribe to a product'})
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
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully subscribed to product',
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
  @ApiResponse({status: 404, description: 'User not found'})
  async subscribe(@Request() req: RequestWithUser, @Body() data: { url: string }) {
    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }
    return this.subscriptionService.subscribe(req.user.userId, data.url);
  }

  @Post('unsubscribe')
  @ApiBearerAuth()
  @ApiOperation({summary: 'Unsubscribe from a product'})
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
  @ApiResponse({status: 404, description: 'User not found'})
  async unsubscribe(
    @Request() req: RequestWithUser,
    @Res() res: Response,
    @Body() data: { productId: string },
  ) {
    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }
    await this.subscriptionService.unsubscribe(req.user.userId, data.productId);
    res.sendStatus(200);
  }
}
