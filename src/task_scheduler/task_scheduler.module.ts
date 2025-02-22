import { Module } from '@nestjs/common';
import { TaskScheduler } from './task_scheduler.service';
import { GamesModule } from 'src/games/games.module';
import { GameSessionKqjModule } from 'src/game_session_kqj/game_session.module';
import { DailyGameModule } from 'src/daily_game/daily_game.module';
import { GamesocketModule } from 'src/gamesocket/gamesocket.module';
import { RecordSessionKqj } from 'src/record_session_kqj/dbrepo/record_session_kqj.repository';
import { RecordSessionKqjModule } from 'src/record_session_kqj/record_session_kqj.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { TransactionSessionModule } from 'src/transaction_session/transaction_session.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    GamesModule,
    GameSessionKqjModule,
    DailyGameModule,
    RecordSessionKqjModule,
    TransactionModule,
    TransactionSessionModule,
    UserModule,
    GamesocketModule,
  ],
  providers: [TaskScheduler],
})
export class TaskSchedulerModule {}
