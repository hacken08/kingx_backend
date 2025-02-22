import { DataSource } from 'typeorm';
import { Message } from './message.repository';

export const RecordSessionKqjProvider = [
  {
    provide: 'MESSAGE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Message),
    inject: ['DATA_SOURCE'],
  },
];
