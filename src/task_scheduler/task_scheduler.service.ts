/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ConflictException,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GameSessionKqj } from 'src/game_session_kqj/dbrepo/game_session.repository';
import { Games } from 'src/games/dbrepo/games.repository';
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
  TokenValues,
} from '../common/constants';
import { DailyGame } from 'src/daily_game/dbrepo/daily_game.repository';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { GamesocketGateway } from 'src/gamesocket/gamesocket.gateway';
import { RecordSessionKqj } from 'src/record_session_kqj/dbrepo/record_session_kqj.repository';
import { TransactionSession } from 'src/transaction_session/dbrepo/transaction_session.repository';
import { User } from 'src/user/dbrepo/user.repository';
import { TransactionService } from 'src/transaction/transaction.service';
import { TransactionSessionService } from 'src/transaction_session/transaction_session.service';

export class TaskScheduler {
  constructor(
    @Inject('GAMES_REPOSITORY')
    private gamesRepository: Repository<Games>,
    @Inject('GAME_SESSION_KQJ_REPOSITORY')
    private gameSessionKqjRepository: Repository<GameSessionKqj>,
    @Inject('DAILY_GAME_REPOSITORY')
    private readonly dailyGameRepository: Repository<DailyGame>,
    @Inject('RECORD_SESSION_KQJ_REPOSITORY')
    private readonly recordSessionKqj: Repository<RecordSessionKqj>,
    @Inject('TRANSACTION_REPOSITORY')
    private readonly transaction: Repository<Transaction>,
    @Inject('TRANSACTION_SESSION_REPOSITORY')
    private readonly transaction_session: Repository<TransactionSession>,
    @Inject('USER_REPOSITORY')
    private readonly user: Repository<User>,
    private readonly transactionService: TransactionService,
    private readonly transactionSessionService: TransactionSessionService,
    private schedulerRegistry: SchedulerRegistry,
    private gamesocketGateway: GamesocketGateway,
  ) {}

  @Cron('30 15 * * *', { name: 'createDailyGame' })
  async creaeDailyGame(): Promise<void> {
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

      await this.dailyGameRepository.save(dailyGameToCreate);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log(error);
        throw new InternalServerErrorException('Failed to create daily games.');
      }
    } finally {
      await this.createGameSessions();
    }
  }

  private async createGameSessions(): Promise<GameSessionKqj[]> {
    const currentDate = new Date();

    // Set the current date (today) without the time component
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const currentDateWithTime = new Date(currentDate.setHours(23, 59, 59, 999));
    console.log('creating game sessions', startOfDay);

    // Fetch today's DailyGame
    const dailyGame = await this.dailyGameRepository.findOne({
      where: {
        createdAt: Between(startOfDay, currentDateWithTime),
      },
      relations: ['games'],
    });

    if (!dailyGame) {
      throw new NotFoundException('No DailyGame entry found for today.');
    }

    const { games } = dailyGame;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { start_time, game_duration, game_in_day, start_date, end_date, id } =
      games;

    // Check for overlapping game sessions
    const overlappingGameSession = await this.gameSessionKqjRepository.findOne({
      where: {
        createdAt: Between(
          startOfDay,
          new Date(
            currentDateWithTime.toLocaleDateString('en-US', {
              timeZone: 'Asia/Kolkata',
            }),
          ),
        ),
        game: { id: id },
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
    const gameSessions = this.gameSessionKqjRepository.create(
      sessionsToCreate.map((session) => ({
        game: games,
        session_start_time: session.start_time,
        session_end_time: session.end_time,
        session_status: session.session_status,
      })),
    );

    try {
      const createdSession =
        await this.gameSessionKqjRepository.save(gameSessions);

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
            this.gameSessionKqjRepository.save(session);
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
            this.gameSessionKqjRepository.save(session);
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
      const latestSessionData = await this.gameSessionKqjRepository.findOne({
        where: { id: session_id },
      });
      const resultOfSesion: GameKqjCards = latestSessionData.game_result_card
        ? latestSessionData.game_result_card
        : await this.generateResult(session_id);
      latestSessionData.game_result_card = resultOfSesion;
      await this.gameSessionKqjRepository.save(latestSessionData);

      // ==========  Fetch bets on this game session ==========
      const userBets = await this.recordSessionKqj.find({
        where: { game_session_id: { id: latestSessionData.id } },
        relations: ['user', 'game_session_id'],
      });

      //  ============== grouping the bet which have made by same user on same card ================
      const groupingSameBets = userBets.reduce<
        Record<string, RecordSessionKqj>
      >(
        (acc, record) => {
          const uniqueKey: string = `${record.user.id}_${record.choosen_card}`;
          if (!acc[uniqueKey]) {
            acc[uniqueKey] = record;
          } else {
            acc[uniqueKey].token += record.token;
          }
          return acc;
        },
        {} as Record<string, RecordSessionKqj>,
      );

      for (const bet of Object.values(groupingSameBets)) {
        if (bet.choosen_card === resultOfSesion) {
          // ✅ Specific card match → 10x payout
          await this.transactionService.updateWallet(bet.user.id, 1, {
            token: bet.token * 10,
            type: TransactionType.CREDIT,
          });

          await this.transactionSessionService.createTransactionSession({
            token: bet.token * 10,
            game_status: GameResultStatus.WIN,
            recordSessionId: bet.id,
          });
        } else if (
          [GameKqjCards.KING, GameKqjCards.QUEEN, GameKqjCards.JACK].includes(
            resultOfSesion as GameKqjCards,
          )
        ) {
          // ✅ King, Queen, Jack won → 3x payout
          await this.transactionService.updateWallet(bet.user.id, 1, {
            token: bet.token * 3,
            type: TransactionType.CREDIT,
          });

          await this.transactionSessionService.createTransactionSession({
            token: bet.token * 3,
            game_status: GameResultStatus.WIN,
            recordSessionId: bet.id,
          });
        } else if (
          [
            GameKqjCards.SPADES,
            GameKqjCards.HEARTS,
            GameKqjCards.DIAMONDS,
            GameKqjCards.CLUBS,
          ].includes(resultOfSesion as GameKqjCards)
        ) {
          // ✅ Suit (Spades, Hearts, Diamonds, Clubs) won → 2x payout
          await this.transactionService.updateWallet(bet.user.id, 1, {
            token: bet.token * 2,
            type: TransactionType.CREDIT,
          });

          await this.transactionSessionService.createTransactionSession({
            token: bet.token * 2,
            game_status: GameResultStatus.WIN,
            recordSessionId: bet.id,
          });
        } else {
          await this.transactionSessionService.createTransactionSession({
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

  async generateResult(gameSessionId: number): Promise<GameKqjCards> {
    // Step 1: Fetch all bets for this game session
    const bets = await this.recordSessionKqj.find({
      where: { game_session_id: { id: gameSessionId } },
      select: ['choosen_card', 'token'],
    });

    // Step 2: Sum up the total bet amount for each specific card
    const specificCardBets: Record<GameKqjCards, number> = Object.fromEntries(
      Object.values(GameKqjCards).map((card) => [card, 0]),
    ) as Record<GameKqjCards, number>;

    let totalBetAmount = 0;

    for (const bet of bets) {
      const betAmount = this.getTokenValue(bet.token); // Convert token to numeric value
      totalBetAmount += betAmount;

      if (this.isSpecificCard(bet.choosen_card)) {
        specificCardBets[bet.choosen_card] += betAmount;
      }
    }

    console.log('specificCardBets ->', specificCardBets);
    console.log('totalBetAmount ->', totalBetAmount);

    // Step 3: Check for strict ratio match (30%, 40%, 50%)
    const ratioChecks = [30, 40, 50]; // The strict ratios to check

    for (const ratio of ratioChecks) {
      for (const [card, amount] of Object.entries(specificCardBets)) {
        const betPercentage = (amount / totalBetAmount) * 100;
        console.log(`${card}=>${betPercentage}`);
        if (Math.abs(betPercentage - ratio) < 0.01) {
          // Strict check allowing minimal floating-point error
          console.log(`Selected card at ${ratio}% rule:`, card);
          return card as GameKqjCards;
        }
      }
    }

    // Step 4: If no exact match, pick the **least bet amount card** to minimize payout
    const filteredBets = Object.entries(specificCardBets)
      .filter(([_, amount]) => amount > 0) // Exclude zero amount cards
      .sort((a, b) => a[1] - b[1]);

    let leastBetCard: GameKqjCards | undefined =
      filteredBets[0]?.[0] as GameKqjCards;

    if (!leastBetCard) {
      // If no least amount is found in specific cards with bets, pick a random card from specific ones
      // Get all specific cards from the GameKqjCards enum that are not general categories
      const allSpecificCards: GameKqjCards[] = [
        GameKqjCards.JACK_OF_SPADES,
        GameKqjCards.QUEEN_OF_SPADES,
        GameKqjCards.KING_OF_SPADES,
        GameKqjCards.JACK_OF_HEARTS,
        GameKqjCards.QUEEN_OF_HEARTS,
        GameKqjCards.KING_OF_HEARTS,
        GameKqjCards.JACK_OF_DIAMONDS,
        GameKqjCards.QUEEN_OF_DIAMONDS,
        GameKqjCards.KING_OF_DIAMONDS,
        GameKqjCards.JACK_OF_CLUBS,
        GameKqjCards.QUEEN_OF_CLUBS,
        GameKqjCards.KING_OF_CLUBS,
      ];

      if (allSpecificCards.length > 0) {
        // Pick a random card from all specific cards (even those with 0 bets)
        leastBetCard =
          allSpecificCards[Math.floor(Math.random() * allSpecificCards.length)];
      }
    }
    return leastBetCard;
  }

  // Helper function: Convert TokenValues to actual numeric bet amount
  getTokenValue(token: TokenValues): number {
    // Define token-to-amount mapping based on your system
    const tokenMap: Record<TokenValues, number> = {
      [TokenValues.TOKEN_11]: 11,
      [TokenValues.TOKEN_110]: 110,
      [TokenValues.TOKEN_100]: 100,
      [TokenValues.TOKEN_1100]: 1100,
      [TokenValues.TOKEN_55]: 55,
      [TokenValues.TOKEN_550]: 550,
      [TokenValues.TOKEN_5500]: 5500,
    };
    return tokenMap[token] || 0;
  }

  // Helper function: Check if a card is a "specific card"
  isSpecificCard(card: GameKqjCards): boolean {
    return ![
      'JACK',
      'QUEEN',
      'KING',
      'SPADES',
      'HEARTS',
      'DIAMONDS',
      'CLUBS',
    ].includes(card);
  }
}
