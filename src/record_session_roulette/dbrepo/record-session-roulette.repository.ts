import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  GameRouletteNumbers,
  RecordSessionStatus,
  TokenValues,
} from 'src/common/constants';
import { BaseEntity } from 'src/common/repository/base.repository';
import { GameResultRoulette } from 'src/game_result_roulette/dbrepo/game_result_roulette.repository';
import { GameSessionRoulette } from 'src/game_session_roulette/dbrepo/game-session-roulette.repository';
import { User } from 'src/user/dbrepo/user.repository';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@ObjectType('RecordSessionRoulette')
@Entity({ name: 'record_session_roulette' })
export class RecordSessionRoulette extends BaseEntity {
  @Field(() => GameRouletteNumbers, { nullable: false })
  @Column({ type: 'enum', enum: GameRouletteNumbers, nullable: false })
  choosen_number: GameRouletteNumbers;

  @Field(() => User, { nullable: false })
  @ManyToOne(() => User, (user) => user.record_session_kqj, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user' })
  user: User;

  @Field(() => TokenValues, { nullable: false })
  @Column({ type: 'enum', enum: TokenValues, nullable: false })
  token: TokenValues;

  @Field(() => RecordSessionStatus, {
    nullable: false,
    defaultValue: RecordSessionStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: RecordSessionStatus,
    nullable: false,
    default: RecordSessionStatus.ACTIVE,
  })
  record_status: RecordSessionStatus;

  @Field(() => GameSessionRoulette, { nullable: false })
  @ManyToOne(
    () => GameSessionRoulette,
    (gameSessionRoulette) => gameSessionRoulette.record_session_roulette,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'game_session_roulette' })
  game_session_roulette: GameSessionRoulette;

  @Field(() => GameResultRoulette, { nullable: true })
  @OneToOne(
    () => GameResultRoulette,
    (transactionSession) => transactionSession.record_session_roulette,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'game_result_roulette' })
  game_result_roulette: GameResultRoulette;
}
