import {
  Injectable,
  NotFoundException,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Between, LessThanOrEqual, MoreThan, Not, Repository } from 'typeorm';
import { User } from 'src/user/dbrepo/user.repository';
import { Games } from './dbrepo/games.repository';
import { CreateGamesDto } from './dto/create-game.input';
import { UpdateGamesDto as UpdateGameDto } from './dto/update-game.input';
import {
  AuditActionType,
  AuditDetails,
  AuditEntityType,
} from 'src/common/constants';
import { PaginatedGamesDto } from './dto/paginated-game.dto';
import { DateFilterDto } from 'src/common/model/date-filter.dto';
import { AuditLog } from 'src/audit-log/dbrepo/audit_log.repository';

@Injectable()
export class GamesService {
  constructor(
    @Inject('GAMES_REPOSITORY')
    private readonly gamesRepository: Repository<Games>,

    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,

    @Inject('AUDIT_LOG_REPOSITORY')
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createGame(createGameDto: CreateGamesDto): Promise<Games> {
    const admin = await this.userRepository.findOne({
      where: { id: createGameDto.admin_id },
    });
    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    const startDate = new Date(createGameDto.start_date);
    startDate.setHours(0, 0, 0, 0);
    createGameDto.start_date = startDate;

    const endDate = new Date(createGameDto.end_date);
    endDate.setHours(23, 59, 59, 999);
    createGameDto.end_date = endDate;

    createGameDto.start_date = startDate;
    createGameDto.end_date = endDate;

    const existingGame = await this.gamesRepository.findOne({
      where: [
        {
          start_date: LessThanOrEqual(createGameDto.end_date),
          end_date: MoreThan(createGameDto.start_date),
        },
        {
          start_date: MoreThan(createGameDto.start_date),
          end_date: LessThanOrEqual(createGameDto.end_date),
        },
      ],
    });

    if (existingGame) {
      throw new ConflictException('A game already exists with this dates');
    }

    const game = this.gamesRepository.create({ ...createGameDto, admin });

    try {
      const game_created = await this.gamesRepository.save(game);
      if (!game_created) {
        throw new InternalServerErrorException(
          'Failed to create GameLaunch. Please try again.',
        );
      }
      const auditDetails = AuditDetails.create(
        game_created.createdAt,
        game_created.admin.username,
        AuditEntityType.Game,
      );
      const audit = this.auditLogRepository.create({
        action: AuditActionType.CREATE,
        entity: AuditEntityType.Game,
        user_id: admin,
        details: auditDetails,
      });
      await this.auditLogRepository.save(audit);
      return game_created;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Internal Server error 400');
    }
  }

  async updateGame(updateGameDto: UpdateGameDto): Promise<Games> {
    try {
      console.log(updateGameDto);

      const game = await this.gamesRepository.findOne({
        where: { id: updateGameDto.game_id },
        relations: { admin: true, gameSession: true },
      });

      if (!game) {
        throw new NotFoundException(
          `Game with ID ${updateGameDto.game_id} not found`,
        );
      }

      const admin = await this.userRepository.findOne({
        where: { id: updateGameDto.admin_id },
      });
      if (!admin) {
        throw new NotFoundException(
          `Admin with ID ${updateGameDto.admin_id} not found`,
        );
      }

      const overlappingGame = await this.gamesRepository.findOne({
        where: [
          {
            id: Not(updateGameDto.game_id),
            start_date: LessThanOrEqual(updateGameDto.end_date),
            end_date: MoreThan(updateGameDto.start_date),
          },
          {
            id: Not(updateGameDto.game_id),
            start_date: MoreThan(updateGameDto.start_date),
            end_date: LessThanOrEqual(updateGameDto.end_date),
          },
        ],
      });

      if (overlappingGame) {
        throw new ConflictException(
          'Another game with overlapping dates already exists',
        );
      }

      const startDate = new Date(updateGameDto.start_date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(updateGameDto.end_date);
      endDate.setHours(23, 59, 59, 999);

      updateGameDto.start_date = startDate;
      updateGameDto.end_date = endDate;

      Object.assign(game, updateGameDto);

      return await this.gamesRepository.save(game);
    } catch (error) {
      console.error('Error updating GameLaunch:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update Game.');
    }
  }

  async getAllGames(skip: number, take: number): Promise<PaginatedGamesDto> {
    try {
      const [data, count] = await this.gamesRepository.findAndCount({
        where: { deletedBy: null },
        relations: { admin: true, gameSession: true },
        skip,
        take,
      });

      if (!data.length) {
        throw new NotFoundException(`No GameLaunches found`);
      }

      return { data, count, skip, take };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve GameLaunches.',
      );
    }
  }

  async getGameById(id: number): Promise<Games> {
    const gameLaunch = await this.gamesRepository.findOne({
      where: { id, deletedBy: null },
      relations: { admin: true, gameSession: true },
    });
    if (!gameLaunch)
      throw new NotFoundException(`GameLaunch with ID ${id} not found`);
    return gameLaunch;
  }

  async deleteGame(id: number): Promise<void> {
    const gameLaunch = await this.gamesRepository.findOne({
      where: { id },
    });
    if (!gameLaunch)
      throw new NotFoundException(`GameLaunch with ID ${id} not found`);

    gameLaunch.deletedBy = 'system';
    gameLaunch.deletedAt = new Date();

    try {
      await this.gamesRepository.save(gameLaunch);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to soft delete GameLaunch.',
      );
    }
  }

  async getGamesByDateOrToday(filter?: DateFilterDto): Promise<Games[]> {
    try {
      let start: Date;
      let end: Date;
      if (filter && filter.startDate && filter.endDate) {
        start = new Date(filter.startDate);
        end = new Date(filter.endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new BadRequestException(
            'Invalid date format. Please provide valid ISO dates.',
          );
        }
      } else {
        const today = new Date();
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date(today.setDate(today.getDate() + 14));
      }
      console.log(Between(start, end));

      const games = await this.gamesRepository.find({
        where: { start_date: Between(start, end) },
        relations: ['gameSession'],
      });
      if (!games.length) {
        return [];
      }
      return games;
    } catch (error) {
      console.error('Error retrieving game sessions:', error);
      throw new InternalServerErrorException(
        'Failed to retrieve game sessions.',
      );
    }
  }

  async getGamesByDate(filter?: DateFilterDto): Promise<Games[]> {
    let start: Date;
    let end: Date;
    if (filter && filter.startDate && filter.endDate) {
      start = new Date(filter.startDate);
      end = new Date(filter.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException(
          'Invalid date format. Please provide valid ISO dates.',
        );
      }
    } else {
      const today = new Date();
      start = new Date(today.setHours(0, 0, 0, 0));
      end = new Date(today.setHours(23, 59, 59, 999));
    }

    return await this.gamesRepository.find({
      where: {
        start_date: Between(start, end),
      },
      relations: { admin: true, gameSession: true },
    });
  }
}
