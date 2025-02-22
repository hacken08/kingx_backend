import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/repository/base.repository';
import { Games } from 'src/games/dbrepo/games.repository';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@ObjectType('DailyGame')
@Entity({ name: 'daily_game' })
export class DailyGame extends BaseEntity {
  @Field(() => Games, { nullable: false })
  @ManyToOne(() => Games, (game) => game.DailyGame, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'game' })
  games: Games;
}
