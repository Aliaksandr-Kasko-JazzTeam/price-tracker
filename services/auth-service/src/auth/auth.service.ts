import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {PrismaService} from '@price-tracker/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(email: string, password: string, name: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {email},
    });

    if (existingUser) throw new ConflictException('User with this email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {email},
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private generateToken(user: { id: string; email: string }) {
    const payload = {sub: user.id, email: user.email};
    return this.jwtService.sign(payload);
  }

  generateServiceToken(serviceName: string) {
    const payload = {
      sub: `service-${serviceName}`,
      email: `${serviceName}@internal`,
      isService: true
    };
    return this.jwtService.sign(payload);
  }
}
