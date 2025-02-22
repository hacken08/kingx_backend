import { Resolver } from '@nestjs/graphql';
import { GameResultRouletteService } from './game_result_roulette.service';

@Resolver()
export class GameResultRouletteResolver {
  constructor(
    private readonly gameResultRouletteService: GameResultRouletteService,
  ) {}
}
