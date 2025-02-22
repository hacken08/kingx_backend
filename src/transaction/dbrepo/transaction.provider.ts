import { DataSource } from 'typeorm';
import { Transaction } from './transaction.repository';

export const TransactionProviders = [
  {
    provide: 'TRANSACTION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Transaction),
    inject: ['DATA_SOURCE'],
  },
];
