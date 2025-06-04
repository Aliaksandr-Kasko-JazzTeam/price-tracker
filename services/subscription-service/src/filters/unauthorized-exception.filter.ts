import {ArgumentsHost, Catch, ExceptionFilter, HttpException, UnauthorizedException} from '@nestjs/common';
import {Response} from 'express';

@Catch()
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof UnauthorizedException ||
      (exception.status === 401) ||
      (exception.message && exception.message.includes('Authentication'))) {
      response.status(401).json({
        statusCode: 401,
        message: exception.message || 'Authentication required',
        error: 'Unauthorized'
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        statusCode: status,
        message: exception.message,
        error: exception.name
      });
      return;
    }

    console.error('Unhandled exception:', exception);
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error'
    });
  }
}
