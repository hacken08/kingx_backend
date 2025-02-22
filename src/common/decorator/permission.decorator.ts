import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (action: string) =>
  SetMetadata(PERMISSIONS_KEY, action);
