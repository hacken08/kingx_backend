import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UpdateGameSessionDto } from './dto/update-game_session.dto';
import { GameSessionKqj } from './dbrepo/game_session.repository';
import { GameSessionKqjService } from './game_session.service';
import { PaginatedGameSessionKqjDto } from './dto/paginated-game-session-kqj.dto';
import { DateFilterDto } from 'src/common/model/date-filter.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { GameSessionKqjStats } from './dto/game_session_stats.dto';

// @UseGuards(AuthGuard)
@Resolver(() => GameSessionKqj)
export class GameSessionKqjResolver {
  constructor(private readonly gameSessionKqjService: GameSessionKqjService) {}

  @Mutation(() => GameSessionKqj)
  async updateGameSession(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('updateGameSessionDto') updateGameSessionDto: UpdateGameSessionDto,
  ): Promise<GameSessionKqj> {
    return await this.gameSessionKqjService.updateGameSession(
      id,
      updateGameSessionDto,
    );
  }

  // @Query(() => GameSessionKqj, { name: 'getGameSessionById' })
  async getGameSessionById(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<GameSessionKqj> {
    return await this.gameSessionKqjService.getGameSessionById(id);
  }

  @Query(() => PaginatedGameSessionKqjDto, { name: 'getAllGameSessions' })
  async getAllGameSessions(
    @Args('skip', { type: () => Int }) skip: number,
    @Args('take', { type: () => Int }) take: number,
  ): Promise<PaginatedGameSessionKqjDto> {
    return this.gameSessionKqjService.getAllGameSessions(skip, take);
  }

  // @Query(() => GameSessionKqj, { name: 'getLiveGameSessions', nullable: true })
  async getLiveGameSessions(): Promise<GameSessionKqj> {
    return await this.gameSessionKqjService.getLiveGameSessions();
  }

  // @Query(() => [GameSessionKqj], { name: 'getGameSessionsByDateOrToday' })
  async getGameSessionsByDateOrToday(
    @Args('filter', { type: () => DateFilterDto, nullable: true })
    filter?: DateFilterDto,
  ): Promise<GameSessionKqj[]> {
    return this.gameSessionKqjService.getGameSessionsByDateOrToday(filter);
  }

  // @Query(() => GameSessionKqjStats, { name: 'getPlayerStateByUserId' })
  async getPlayerStateByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    filter?: DateFilterDto,
  ): Promise<GameSessionKqjStats> {
    return this.gameSessionKqjService.getPlayerStats(userId);
  }
}
