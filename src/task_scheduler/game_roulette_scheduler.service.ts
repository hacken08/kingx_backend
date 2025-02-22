import {
  ConflictException,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  Transaction,
} from 'typeorm';
import {
  GameKqjCards,
  GameSessionStatus,
  TransactionType,
  GameResultStatus,
  GameRouletteNumbers,
} from '../common/constants';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { GamesocketGateway } from 'src/gamesocket/gamesocket.gateway';
import { RecordSessionKqj } from 'src/record_session_kqj/dbrepo/record_session_kqj.repository';
import { TransactionSession } from 'src/transaction_session/dbrepo/transaction_session.repository';
import { User } from 'src/user/dbrepo/user.repository';
import { TransactionService } from 'src/transaction/transaction.service';
import { DailyGameRoulette } from 'src/daily_game_roulette/dbrepo/daily-game-roulette.repository';
import { GameSessionRoulette } from 'src/game_session_roulette/dbrepo/game-session-roulette.repository';
import { GameRoulette } from 'src/game_roulette/dbrepo/game-roulette.repository';
import { RecordSessionRoulette } from 'src/record_session_roulette/dbrepo/record-session-roulette.repository';
import { GameResultRoulette } from 'src/game_result_roulette/dbrepo/game_result_roulette.repository';
import { GameResultRouletteService } from 'src/game_result_roulette/game_result_roulette.service';

export class GameRouletteScheduler {
  constructor(
    @Inject('GAMES_ROULETTE_REPOSITORY')
    private readonly gamesRepository: Repository<GameRoulette>,
    @Inject('GAMES_SESSION_ROULETTE_REPOSITORY')
    private readonly gameSessionRouletteRepository: Repository<GameSessionRoulette>,
    @Inject('DAILY_GAME_ROULETTE_REPOSITORY')
    private readonly dailyGameRouletteRepository: Repository<DailyGameRoulette>,
    @Inject('RECORD_SESSION_ROULETTE_REPOSITORY')
    private readonly recordSessionRouletteRepository: Repository<RecordSessionRoulette>,
    @Inject('TRANSACTION_REPOSITORY')
    private readonly transaction: Repository<Transaction>,
    @Inject('GAME_RESULT_ROULETTE_REPOSITORY')
    private readonly gameResultRouletteRepository: Repository<GameResultRoulette>,
    @Inject('USER_REPOSITORY')
    private readonly user: Repository<User>,
    private readonly transactionService: TransactionService,
    private readonly gameResultRouletteService: GameResultRouletteService,
    private schedulerRegistry: SchedulerRegistry,
    private gamesocketGateway: GamesocketGateway,
  ) {}

  @Cron('33 00 * * *', { name: 'creaeDailyGameRoulette' })
  async creaeDailyGameRoulette(): Promise<void> {
    // .............testing code ...........
    // const session = await this.gameSessionKqjRepository.findOne({ where: { id: 407 } });
    // await this.drawResult(session);
    // .............................

    try {
      const currentDate = new Date();
      console.log(currentDate);

      const game = await this.gamesRepository.findOne({
        where: {
          start_date: LessThanOrEqual(currentDate),
          end_date: MoreThanOrEqual(currentDate),
        },
      });

      if (!game) {
        throw new NotFoundException('No game found for the current date.');
      }

      const dailyGameToCreate = {
        games: game,
        createdAt: currentDate,
        updatedAt: currentDate,
      };

      await this.dailyGameRouletteRepository.save(dailyGameToCreate);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log(error);
        throw new InternalServerErrorException('Failed to create daily games.');
      }
    } finally {
      await this.createGameSessionRoulette();
    }
  }

  private async createGameSessionRoulette(): Promise<GameSessionRoulette[]> {
    const currentDate = new Date();

    // Set the current date (today) without the time component
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const currentDateWithTime = new Date(currentDate.setHours(23, 59, 59, 999));
    console.log('creating game sessions', startOfDay);

    // Fetch today's DailyGame
    const dailyGame = await this.dailyGameRouletteRepository.findOne({
      where: {
        createdAt: Between(startOfDay, currentDateWithTime),
      },
      relations: { game_roulette: true },
    });

    if (!dailyGame) {
      throw new NotFoundException('No DailyGame entry found for today.');
    }

    const { game_roulette } = dailyGame;
    const { start_time, game_duration, game_in_day, start_date, end_date, id } =
      game_roulette;

    // Check for overlapping game sessions
    const overlappingGameSession =
      await this.gameSessionRouletteRepository.findOne({
        where: {
          createdAt: Between(
            startOfDay,
            new Date(
              currentDateWithTime.toLocaleDateString('en-US', {
                timeZone: 'Asia/Kolkata',
              }),
            ),
          ),
          game_roulette: { id: id },
        },
        // where: [
        //   {
        //     session_start_time: LessThanOrEqual(end_date),
        //     session_end_time: MoreThan(start_date),
        //   },
        //   {
        //     session_start_time: MoreThan(start_date),
        //     session_end_time: LessThanOrEqual(end_date),
        //   },
        // ],
      });

    if (overlappingGameSession)
      throw new ConflictException(
        'A game session already exists within the specified time range.',
      );

    // Helper function to add seconds to a time string and return a Date with both date and time
    const addSecondsToDateTime = (
      date: Date,
      time: string,
      seconds: number = 0,
    ): Date => {
      const [hours, minutes, secs] = time.split(':').map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes, secs || 0, 0); // Set the time component
      combinedDate.setSeconds(combinedDate.getSeconds() + seconds); // Add the seconds
      return combinedDate;
    };

    // Create session start and end times
    const sessionsToCreate: {
      start_time: Date;
      end_time: Date;
      session_status: GameSessionStatus;
    }[] = [];
    let currentStartTime = addSecondsToDateTime(startOfDay, start_time); // Initial session start time at game start time
    const currentTime = new Date();
    // Iterate to create the sessions
    for (let i = 0; i < game_in_day; i++) {
      // Calculate the end time for each session based on the game duration
      const endTime = new Date(currentStartTime);
      endTime.setSeconds(currentStartTime.getSeconds() + game_duration); // Add game_duration in seconds to get the end time

      sessionsToCreate.push({
        start_time: currentStartTime,
        end_time: endTime,
        session_status:
          currentTime.getTime() < endTime.getTime() &&
          currentTime.getTime() > currentStartTime.getTime()
            ? GameSessionStatus.LIVE
            : currentTime.getTime() < currentStartTime.getTime()
              ? GameSessionStatus.UPCOMING
              : GameSessionStatus.END,
      });
      currentStartTime = endTime;
    }

    // Map the sessions to the GameSessionKqj format
    const gameSessions = this.gameSessionRouletteRepository.create(
      sessionsToCreate.map((session) => ({
        game_roulette: game_roulette,
        session_start_time: session.start_time,
        session_end_time: session.end_time,
        session_status: session.session_status,
      })),
    );

    try {
      const createdSession =
        await this.gameSessionRouletteRepository.save(gameSessions);

      for (const session of gameSessions) {
        let start = new Date(session.session_start_time);
        let end = new Date(session.session_end_time);

        // Convert to IST and reassign to the same variables
        start = new Date(
          start.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        );
        end = new Date(
          end.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
        );

        console.log('set start time to   ->', start);
        console.log('set end time to   ->', end);

        if (typeof start === 'string' || typeof end === 'string') {
          start = new Date(start);
          end = new Date(end);
        }
        // Validate Date
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.error(
            'Invalid date for session_start_time:',
            session.session_start_time,
          );
          continue;
        }
        const toMinmiumDigit = (value: number) =>
          `${value < 10 ? `0${value}` : value}`;
        // start game
        const startJob: CronJob = new CronJob(
          `${toMinmiumDigit(start.getMinutes())} ${toMinmiumDigit(start.getHours())} ${toMinmiumDigit(start.getDate())} ${toMinmiumDigit(start.getMonth() + 1)} *`,
          async () => {
            console.log(`game session start time  -> `, {
              id: session.id,
              time: `${toMinmiumDigit(start.getMinutes())} ${toMinmiumDigit(start.getHours())} ${toMinmiumDigit(start.getDate())} ${toMinmiumDigit(start.getMonth() + 1)} *`,
              update_status: GameSessionStatus.LIVE,
            });
            session.session_status = GameSessionStatus.LIVE;
            this.gameResultRouletteRepository.save(session);
            this.gamesocketGateway.broadcastEvent('gameStart', {
              sessionId: session.id,
              status: session.session_status,
            });
            // console.log("event sended to all socket");
          },
        );
        startJob.runOnce = true;

        // end game
        const endJob: CronJob = new CronJob(
          `${toMinmiumDigit(end.getMinutes())} ${toMinmiumDigit(end.getHours())} ${toMinmiumDigit(end.getDate())} ${toMinmiumDigit(end.getMonth() + 1)} *`,
          async () => {
            session.session_status = GameSessionStatus.END;
            this.gameSessionRouletteRepository.save(session);
            console.log(`game session end time  -> `, {
              id: session.id,
              time: `${toMinmiumDigit(end.getMinutes())} ${toMinmiumDigit(end.getHours())} ${toMinmiumDigit(end.getDate())} ${toMinmiumDigit(end.getMonth() + 1)} *`,
              update_status: session.session_status,
            });
            console.log('====================================');
            this.gamesocketGateway.broadcastEvent('gameEnd', {
              sessionId: session.id,
              status: session.session_status,
            });
          },
        );
        endJob.runOnce = true;

        const resultJob: CronJob = new CronJob(
          `${toMinmiumDigit(end.getMinutes())} ${toMinmiumDigit(end.getHours())} ${toMinmiumDigit(end.getDate())} ${toMinmiumDigit(end.getMonth() + 1)} *`,
          async () => {
            const game_result = await this.drawResult(session.id);
            console.log('game ka result -> ', {
              id: session.id,
              game_result,
              time: `${toMinmiumDigit(end.getMinutes())} ${toMinmiumDigit(end.getHours())} ${toMinmiumDigit(end.getDate())} ${toMinmiumDigit(end.getMonth() + 1)} *`,
            });
            this.gamesocketGateway.broadcastEvent('gameResult', {
              sessionId: session.id,
              ...game_result,
            });
          },
        );
        resultJob.runOnce = true;

        this.schedulerRegistry.addCronJob(`session start ${start}`, startJob);
        this.schedulerRegistry.addCronJob(`session end ${end}`, endJob);
        this.schedulerRegistry.addCronJob(`session result ${end}`, resultJob);

        startJob.start();
        endJob.start();
        resultJob.start();
      }

      if (!createdSession) {
        throw new InternalServerErrorException(
          'Failed to save game sessions. Please try again.',
        );
      }
      return createdSession;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Error saving game sessions.',
        error,
      );
    }
  }

  async drawResult(session_id: number): Promise<object> {
    try {
      //  =========== handling result of game ====================
      const latestSessionData =
        await this.gameSessionRouletteRepository.findOne({
          where: { id: session_id },
        });
      const resultOfSesion: GameRouletteNumbers =
        latestSessionData.game_result_number
          ? latestSessionData.game_result_number
          : this.generateResult();
      latestSessionData.game_result_number = resultOfSesion;
      await this.gameSessionRouletteRepository.save(latestSessionData);

      // ==========  Fetch bets on this game session ==========
      const userBets = await this.recordSessionRouletteRepository.find({
        where: { game_session_roulette: { id: latestSessionData.id } },
        relations: ['user', 'game_session_id'],
      });

      //  ============== grouping the bet which have made by same user on same card ================
      const groupingSameBets = userBets.reduce<
        Record<string, RecordSessionRoulette>
      >(
        (acc, record) => {
          const uniqueKey: string = `${record.user.id}_${record.choosen_number}`;
          if (!acc[uniqueKey]) {
            acc[uniqueKey] = record;
          } else {
            acc[uniqueKey].token += record.token;
          }
          return acc;
        },
        {} as Record<string, RecordSessionRoulette>,
      );

      for (const bet of Object.values(groupingSameBets)) {
        if (bet.choosen_number === resultOfSesion) {
          //  ============== Creating game win result and adding money to there account ================
          await this.transactionService.updateWallet(bet.user.id, 1, {
            token: bet.token * 2,
            type: TransactionType.CREDIT,
          });
          this.gameResultRouletteService.createGameResult({
            token: bet.token * 2,
            game_status: GameResultStatus.WIN,
            recordSessionId: bet.id,
          });
        } else {
          //  ============== Creating game loss result ================
          this.gameResultRouletteService.createGameResult({
            token: bet.token,
            game_status: GameResultStatus.LOSS,
            recordSessionId: bet.id,
          });
        }
      }
      return { result: resultOfSesion };
    } catch (error) {
      console.error(error);
      new InternalServerErrorException(
        'Unable draw result. Something went wrong at backend',
      );
    }
  }

  generateResult(): GameRouletteNumbers {
    const values = Object.values(GameRouletteNumbers) as GameRouletteNumbers[];
    const randomIndex = Math.floor(Math.random() * values.length);
    return values[randomIndex];
  }
}
