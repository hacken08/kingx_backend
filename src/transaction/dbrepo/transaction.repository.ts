import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Status, TransactionType } from 'src/common/constants/enums';
import { BaseEntity } from 'src/common/repository/base.repository';
import { User } from 'src/user/dbrepo/user.repository';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

registerEnumType(Status, { name: 'Status' });
registerEnumType(TransactionType, { name: 'TransactionType' });
@ObjectType('Transaction')
@Entity({ name: 'transaction' })
export class Transaction extends BaseEntity {
  @Field(() => Number)
  @Column({ type: 'int', default: 0 })
  amount: number;

  @Field(() => TransactionType)
  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.CREDIT,
    nullable: false,
  })
  type: TransactionType;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userTransactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: User;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.userTransactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'admin' })
  admin: User;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  transactionDate: Date;
}
