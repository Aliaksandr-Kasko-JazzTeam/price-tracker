import {ExecutionContext, Injectable} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {Observable} from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (info) {
      switch (info.name) {
        case 'TokenExpiredError':
          return null;
        case 'JsonWebTokenError':
          return null;
        case 'NotBeforeError':
          return null;
      }
    }

    if (err || !user) {
      return null;
    }

    return user;
  }
}
