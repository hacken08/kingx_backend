import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { AuditLog } from 'src/audit-log/dbrepo/audit_log.repository';
import { Role, UserStatus } from 'src/common/constants/enums';
import { BaseEntity } from 'src/common/repository/base.repository';
import { GameRoulette } from 'src/game_roulette/dbrepo/game-roulette.repository';
import { Games } from 'src/games/dbrepo/games.repository';
import { Message } from 'src/message/dbrepo/message.repository';
import { Notification } from 'src/notification/dbrepo/notification.repository';
import { Permission } from 'src/permission/dbrepo/permission.repository';
import { RecordSessionKqj } from 'src/record_session_kqj/dbrepo/record_session_kqj.repository';
import { RecordSessionRoulette } from 'src/record_session_roulette/dbrepo/record-session-roulette.repository';
import { Room } from 'src/room/dbrepo/room.repository';
import { Transaction } from 'src/transaction/dbrepo/transaction.repository';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

registerEnumType(Role, { name: 'Role' });
registerEnumType(UserStatus, { name: 'UserStatus' });
@ObjectType('User')
@Entity({ name: 'user' })
export class User extends BaseEntity {
  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 60, nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 60, nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  profile: string;

  @Field(() => String)
  @Column({ unique: true, type: 'varchar', length: 60, nullable: false })
  username: string;

  @Field(() => String)
  @Column({ unique: true, type: 'varchar', length: 225, nullable: false })
  email: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 225, nullable: false })
  password: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 40, nullable: false })
  city: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 40, nullable: false })
  phone_number: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'varchar', length: 40, nullable: true })
  otp: string;

  @Field(() => Role)
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
    nullable: false,
  })
  role: Role;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  first_time_password_reset: boolean;

  @Field(() => Number)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  wallet: number;

  @Field(() => Number)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  wallet_limit: number;

  @Field(() => UserStatus)
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    nullable: false,
  })
  status: UserStatus;

  @Field(() => Transaction)
  @OneToMany(
    () => Transaction,
    (transaction) => transaction.user && transaction.admin,
  )
  @JoinColumn({ name: 'userTransactions' })
  userTransactions: Transaction[];

  @Field(() => Games)
  @OneToMany(() => Games, (game) => game.admin)
  @JoinColumn({ name: 'createdGames' })
  createdGames: Games[];

  @Field(() => GameRoulette)
  @OneToMany(() => GameRoulette, (gameRoulette) => gameRoulette.admin)
  @JoinColumn({ name: 'game_roulete' })
  game_roulete: GameRoulette[];

  @Field(() => RecordSessionKqj)
  @OneToMany(
    () => RecordSessionKqj,
    (recordSessionKqj) => recordSessionKqj.user,
  )
  @JoinColumn({ name: 'record_session_kqj' })
  record_session_kqj: RecordSessionKqj[];

  @Field(() => RecordSessionRoulette)
  @OneToMany(
    () => RecordSessionRoulette,
    (recordSessionRoulette) => recordSessionRoulette.user,
  )
  @JoinColumn({ name: 'record_session_roulette' })
  record_session_roulette: RecordSessionRoulette[];

  @Field(() => Room)
  @ManyToOne(() => Room, (room) => room.members)
  roomMember: Room;

  @OneToOne(() => Message, (message) => message.sender)
  @JoinColumn({ name: 'sender' })
  sender: Message;

  @Field(() => AuditLog)
  @OneToMany(() => AuditLog, (audit) => audit.user_id)
  @JoinColumn({ name: 'audit_log_id' })
  audit_log_id: AuditLog;

  @Field(() => Permission)
  @OneToMany(() => Permission, (permission) => permission.user)
  @JoinColumn({ name: 'permissions' })
  permissions: Permission[];

  @OneToMany(() => Notification, (notification) => notification.user)
  @JoinColumn({ name: 'notifications' })
  notifications: Notification;
}
