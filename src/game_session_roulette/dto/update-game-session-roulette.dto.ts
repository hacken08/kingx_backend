import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';
import { GameRouletteNumbers } from 'src/common/constants';

@InputType()
export class UpdateGameSessionRouletteDto {
  @Field(() => GameRouletteNumbers, { nullable: false })
  @IsNotEmpty({ message: 'game result number must be provided' })
  game_result_roulette_number: GameRouletteNumbers;
}
