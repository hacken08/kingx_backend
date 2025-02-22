import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { EnvKeyConstants } from 'src/common/constants';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const accessToken = this.extractTokenFromHeader(ctx.req);

    if (!accessToken) {
      throw new UnauthorizedException('Access token is missing');
    }
    // console.log(accessToken);

    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: EnvKeyConstants.JWT_SECRET,
      });

      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const user = await this.userService.getUserById(payload.id);

      // if (!user) {
      //   throw new UnauthorizedException('User not found');
      // }

      ctx.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Error verifying token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    return request.headers.authorization;
  }
}
