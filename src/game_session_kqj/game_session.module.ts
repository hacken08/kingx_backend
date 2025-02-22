import { forwardRef, Module } from '@nestjs/common';
import { GameSessionKqjProviders } from './dbrepo/game_session_provider';
import { GameSessionKqjResolver } from './game_session.resolver';
import { GameSessionKqjService } from './game_session.service';
import { UserModule } from 'src/user/user.module';
import { PermissionModule } from 'src/permission/permission.module';
import { RecordSessionKqjModule } from 'src/record_session_kqj/record_session_kqj.module';
import { TransactionSessionModule } from 'src/transaction_session/transaction_session.module';

@Module({
  imports: [
    PermissionModule,
    forwardRef(() => UserModule),
    forwardRef(() => TransactionSessionModule),
  ],
  providers: [
    GameSessionKqjResolver,
    GameSessionKqjService,
    ...GameSessionKqjProviders,
  ],
  exports: [GameSessionKqjService, ...GameSessionKqjProviders],
})
export class GameSessionKqjModule {}
