import { DataSource } from 'typeorm';
import { Notification } from './notification.repository';

export const NotificationProviders = [
  {
    provide: 'NOTIFICATION_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Notification),
    inject: ['DATA_SOURCE'],
  },
];
