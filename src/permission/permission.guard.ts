import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PermissionService } from './permission.service';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/common/decorator/permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const user = ctx.user;
    console.log('hbjbhjbhj');
    if (!user) {
      throw new UnauthorizedException('User not authenticatedd');
    }
    console.log('gfhh');
    const action = this.reflector.get<string>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!action) {
      throw new ForbiddenException('Action is undefined');
    }

    // Check permissions using the full user entity
    const isAllowed = await this.permissionService.isActionAllowed(
      user,
      action,
    );

    if (!isAllowed) {
      throw new ForbiddenException(
        `You do not have permission to perform the action: ${action}`,
      );
    }

    return true;
  }
}
