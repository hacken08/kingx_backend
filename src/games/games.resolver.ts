import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CreateGamesDto } from './dto/create-game.input';
import { GamesService } from './games.service';
import { Games } from './dbrepo/games.repository';
import { UpdateGamesDto } from './dto/update-game.input';
import { PaginatedGamesDto } from './dto/paginated-game.dto';
import { DateFilterDto } from 'src/common/model/date-filter.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionAction } from 'src/common/constants';
import { Permissions } from 'src/common/decorator/permission.decorator';
import { PermissionGuard } from 'src/permission/permission.guard';

@UseGuards(AuthGuard)
@Resolver(() => Games)
export class GamesResolver {
  constructor(private readonly GamesService: GamesService) {}

  // @UseGuards(PermissionGuard)
  // @Permissions(PermissionAction.CREATEGAME)
  @Mutation(() => Games)
  async createGames(
    @Args('createGamesDto') createGamesDto: CreateGamesDto,
  ): Promise<Games> {
    return await this.GamesService.createGame(createGamesDto);
  }

  @Permissions(PermissionAction.UPDATEGAME)
  @Mutation(() => Games)
  async updateGames(
    @Args('updateGamesDto') updateGamesDto: UpdateGamesDto,
  ): Promise<Games> {
    return await this.GamesService.updateGame(updateGamesDto);
  }

  @Permissions(PermissionAction.DELETEGAME)
  @Mutation(() => Boolean)
  async DeleteGames(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<boolean> {
    await this.GamesService.deleteGame(id);
    return true;
  }

  @Query(() => PaginatedGamesDto, { name: 'getAllGameses' })
  async getAllGameses(
    @Args('skip', { type: () => Int }) skip: number,
    @Args('take', { type: () => Int }) take: number,
  ): Promise<PaginatedGamesDto> {
    return await this.GamesService.getAllGames(skip, take);
  }

  @Query(() => Games, { name: 'getGamesBy' })
  async getGamesById(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<Games> {
    return await this.GamesService.getGameById(id);
  }

  @Query(() => [Games], { name: 'getGamesByDate' })
  async getGamesByDate(
    @Args('filter', { type: () => DateFilterDto, nullable: true })
    filter?: DateFilterDto,
  ): Promise<Games[]> {
    return await this.GamesService.getGamesByDate(filter);
  }

  @Query(() => [Games], { name: 'getGamesByDateOrToday' })
  async getGamesByDateOrToday(
    @Args('filter', { type: () => DateFilterDto, nullable: true })
    filter?: DateFilterDto,
  ): Promise<Games[]> {
    return this.GamesService.getGamesByDateOrToday(filter);
  }
}
