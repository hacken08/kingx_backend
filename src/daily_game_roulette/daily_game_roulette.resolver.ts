import { Resolver } from '@nestjs/graphql';
import { DailyGameRouletteService } from './daily_game_roulette.service';

@Resolver()
export class DailyGameRouletteResolver {
  constructor(
    private readonly dailyGameRouletteService: DailyGameRouletteService,
  ) {}
}
