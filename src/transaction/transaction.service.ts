import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Between, Repository } from 'typeorm';
import { User } from 'src/user/dbrepo/user.repository';
import { Transaction } from 'src/transaction/dbrepo/transaction.repository';
import { TransactionType } from 'src/common/constants';
import { WalletDto } from './dto/wallet.dto';
import { DateFilterDto } from 'src/common/model/date-filter.dto';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepository: Repository<Transaction>,
  ) {}

  async updateWallet(userId: number, adminId: number, walletDto: WalletDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    if (!admin) throw new NotFoundException('Admin not found');

    if (walletDto.type === TransactionType.CREDIT) {
      user.wallet = parseInt(user.wallet.toString()) + walletDto.token;
    } else if (walletDto.type === TransactionType.DEBIT) {
      if (user.wallet < walletDto.token) {
        throw new BadRequestException('Insufficient funds');
      }
      user.wallet = parseInt(user.wallet.toString()) - walletDto.token;
    }

    await this.userRepository.save(user);
    const transaction = this.transactionRepository.create({
      user: { id: user.id },
      admin: { id: admin.id },
      amount: walletDto.token,
      type: walletDto.type,
      createdAt: new Date(),
      createdBy: admin.username,
    });

    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async getTransactionsByDate(
    dateFilter: DateFilterDto,
  ): Promise<Transaction[]> {
    let start: Date;
    let end: Date;

    if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
      start = new Date(dateFilter.startDate);
      end = new Date(dateFilter.endDate);

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

    return this.transactionRepository.find({
      where: {
        createdAt: Between(start, end),
      },
      relations: ['user', 'admin'],
    });
  }

  async getTrasactionByUserId(userId: number): Promise<Transaction[]> {
    let start: Date;
    let end: Date;

    return this.transactionRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'admin'],
    });
  }
}
