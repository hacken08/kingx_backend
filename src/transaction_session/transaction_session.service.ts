import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { TransactionSession } from './dbrepo/transaction_session.repository';
import { CreateTransactionSessionDto } from './dto/create-transaction_session.input';
import { RecordSessionKqj } from 'src/record_session_kqj/dbrepo/record_session_kqj.repository';
import { TransactionType } from 'src/common/constants';
import { User } from 'src/user/dbrepo/user.repository';
import { ProfitAndLoss } from '../dashboard/dto/profite-loss.input';
import { DateFilterDto } from 'src/common/model/date-filter.dto';

@Injectable()
export class TransactionSessionService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('TRANSACTION_SESSION_REPOSITORY')
    private readonly transactionSessionRepository: Repository<TransactionSession>,
    @Inject('RECORD_SESSION_KQJ_REPOSITORY')
    private readonly recordSessionRepository: Repository<RecordSessionKqj>,
  ) {}

  async createTransactionSession(
    dto: CreateTransactionSessionDto,
  ): Promise<TransactionSession> {
    const recordSession = await this.recordSessionRepository.findOne({
      where: { id: dto.recordSessionId },
      relations: ['user', 'game_session_id', 'transaction_session'],
    });
    if (!recordSession) {
      throw new NotFoundException(
        `RecordSession with ID ${dto.recordSessionId} not found`,
      );
    }

    if (!recordSession.user)
      throw new BadRequestException(
        'Associated user not found in record session.',
      );
    // if (dto.type === TransactionType.CREDIT) {
    //   recordSession.user.wallet += dto.token;
    // } else if (dto.type === TransactionType.DEBIT) {
    //   if (recordSession.user.wallet < dto.token) {
    //     throw new BadRequestException(
    //       'Insufficient funds for this transaction.',
    //     );
    //   }
    //   recordSession.user.wallet -= dto.token;
    // }
    // try {
    //   await this.userRepository.save(recordSession.user);
    // } catch (error) {
    //   console.error('Error updating user wallet:', error);
    //   throw new InternalServerErrorException(
    //     'Failed to update user wallet. Please try again.',
    //   );
    // }

    const transactionSession = this.transactionSessionRepository.create({
      token: dto.token,
      game_status: dto.game_status,
      record_session_kqj: recordSession,
      createdAt: new Date(),
    });

    try {
      return await this.transactionSessionRepository.save(transactionSession);
    } catch (error) {
      console.error('Error saving transaction session:', error);
      throw new InternalServerErrorException(
        'Failed to create transaction session.',
      );
    }
  }

  async getTransactionSessionById(id: number): Promise<TransactionSession> {
    const transactionSession = await this.transactionSessionRepository.findOne({
      where: { id },
      relations: ['record_session_kqj'],
    });
    if (!transactionSession) {
      throw new NotFoundException(`TransactionSession with ID ${id} not found`);
    }
    return transactionSession;
  }

  async getAllTransactionSessions(): Promise<TransactionSession[]> {
    try {
      return await this.transactionSessionRepository.find({
        relations: ['record_session_kqj'],
      });
    } catch (error) {
      throw new BadRequestException('Failed to retrieve transaction sessions');
    }
  }

  async getTransactionsByUserId(userId: number): Promise<TransactionSession[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    try {
      const userResult = await this.transactionSessionRepository.find({
        relations: [
          'record_session_kqj',
          'record_session_kqj.user',
          'record_session_kqj.game_session_id',
        ],
        where: { record_session_kqj: { user: { id: userId } } },
      });
      if (!userResult) {
        throw new NotFoundException(`records with userId ${userId} not found`);
      }
      return userResult;
    } catch (error) {
      console.error(`Error fetching transactions for user ${userId}:`, error);
      throw new InternalServerErrorException(
        'Failed to fetch transactions for the specified user.',
      );
    }
  }

  async getTransactionsByDate(
    filter?: DateFilterDto,
  ): Promise<TransactionSession[]> {
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
      if (start >= end) {
        throw new BadRequestException('Start date must be before end date.');
      }
    } else {
      const today = new Date();
      start = new Date(today.setHours(0, 0, 0, 0));
      end = new Date(today.setHours(23, 59, 59, 999));
    }

    try {
      return await this.transactionSessionRepository.find({
        where: {
          createdAt: Between(start, end),
        },
        relations: ['record_session_kqj', 'record_session_kqj.user'],
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch transactions by date.');
    }
  }
}
