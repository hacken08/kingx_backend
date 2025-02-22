import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';
import { TransactionProviders } from './dbrepo/transaction.provider';
import { UserModule } from 'src/user/user.module';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  imports: [UserModule, PermissionModule],
  providers: [TransactionResolver, TransactionService, ...TransactionProviders],
  exports: [...TransactionProviders, TransactionService],
})
export class TransactionModule {}
