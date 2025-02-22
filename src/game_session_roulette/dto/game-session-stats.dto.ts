import { Field, Int, ObjectType } from '@nestjs/graphql';
@ObjectType('GameSessionRouletteStats')
export class GameSessionRouletteStats {
  @Field(() => Int)
  totalGamePlayed: number;

  @Field(() => Int)
  totalWins: number;

  @Field(() => Int)
  totalLosses: number;
}
