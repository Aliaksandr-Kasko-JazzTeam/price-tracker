import {Body, Controller, Headers, Post, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {SignUpDto} from './dto/sign-up.dto';
import {SignInDto} from './dto/sign-in.dto';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  @ApiResponse({status: 409, description: 'User with this email already exists'})
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.name,
    );
  }

  @Post('signin')
  @ApiOperation({summary: 'Sign in an existing user'})
  @ApiResponse({
    status: 200,
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
  @ApiResponse({status: 401, description: 'Invalid credentials'})
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post('service-token')
  @ApiOperation({summary: 'Get a service token for internal service communication'})
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Service token generated successfully',
    schema: {
      type: 'object',
      properties: {
        token: {type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'},
      },
    },
  })
  @ApiResponse({status: 401, description: 'Invalid service secret'})
  async getServiceToken(
    @Headers('x-service-secret') secret: string,
    @Body('serviceName') serviceName: string,
  ) {
    if (secret !== this.configService.get<string>('SERVICE_SECRET')) {
      throw new UnauthorizedException('Invalid service secret');
    }
    return {token: this.authService.generateServiceToken(serviceName)};
  }
}
