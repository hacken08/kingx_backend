import { Module } from '@nestjs/common';
import { GamesocketService } from './gamesocket.service';
import { GamesocketGateway } from './gamesocket.gateway';

@Module({
  providers: [GamesocketGateway, GamesocketService],
  exports: [GamesocketGateway],
})
export class GamesocketModule {}
