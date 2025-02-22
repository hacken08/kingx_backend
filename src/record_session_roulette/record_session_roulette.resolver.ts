import { Resolver } from '@nestjs/graphql';
import { RecordSessionRouletteService } from './record_session_roulette.service';

@Resolver()
export class RecordSessionRouletteResolver {
  constructor(
    private readonly recordSessionRouletteService: RecordSessionRouletteService,
  ) {}
}
