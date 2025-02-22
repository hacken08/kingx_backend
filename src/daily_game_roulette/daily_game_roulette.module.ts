import { Module } from '@nestjs/common';
import { DailyGameRouletteService } from './daily_game_roulette.service';
import { DailyGameRouletteResolver } from './daily_game_roulette.resolver';
import { DailyGameRouletteProviders } from './dbrepo/daily-game-roulette.provider';

@Module({
  providers: [
    DailyGameRouletteResolver,
    DailyGameRouletteService,
    ...DailyGameRouletteProviders,
  ],
  exports: [...DailyGameRouletteProviders],
})
export class DailyGameRouletteModule {}
