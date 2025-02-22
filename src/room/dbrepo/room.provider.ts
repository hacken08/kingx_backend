import { DataSource } from 'typeorm';
import { Room } from './room.repository';

export const RecordSessionKqjProvider = [
  {
    provide: 'ROOM_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Room),
    inject: ['DATA_SOURCE'],
  },
];
