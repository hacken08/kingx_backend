import { Module } from '@nestjs/common';
import { GameRouletteService } from './game_roulette.service';
import { GameRouletteResolver } from './game_roulette.resolver';
import { GameRouletteProviders } from './dbrepo/game-roulette.provider';
import { UserModule } from 'src/user/user.module';
import { AuditLogModule } from 'src/audit-log/audit-log.module';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  imports: [UserModule, AuditLogModule, PermissionModule],
  providers: [
    GameRouletteResolver,
    GameRouletteService,
    ...GameRouletteProviders,
  ],
  exports: [...GameRouletteProviders],
})
export class GameRouletteModule {}
