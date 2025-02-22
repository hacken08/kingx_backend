import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/repository/base.repository';
import { GameRoulette } from 'src/game_roulette/dbrepo/game-roulette.repository';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@ObjectType('DailyGameRoulette')
@Entity({ name: 'daily_game_roulette' })
export class DailyGameRoulette extends BaseEntity {
  @Field(() => GameRoulette, { nullable: false })
  @ManyToOne(
    () => GameRoulette,
    (gameRoulette) => gameRoulette.daily_game_roulette,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'game_roulette' })
  game_roulette: GameRoulette;
}
