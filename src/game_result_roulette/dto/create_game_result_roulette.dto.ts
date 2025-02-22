import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { TokenValues, GameResultStatus } from 'src/common/constants';

@InputType()
export class CreateGameResultDto {
  @Field(() => TokenValues, { nullable: false })
  @IsNotEmpty({ message: 'Token value cannot be empty' })
  @IsEnum(TokenValues, { message: 'Invalid token value' })
  token: TokenValues;

  @Field(() => GameResultStatus, { nullable: false })
  @IsNotEmpty({ message: 'game result type cannot be empty' })
  @IsEnum(GameResultStatus, { message: 'Invalid transaction type' })
  game_status: GameResultStatus;

  @Field(() => Number, { nullable: false })
  @IsNotEmpty({ message: 'Record session ID cannot be empty' })
  @IsNumber({}, { message: 'Record session ID must be a number' })
  recordSessionId: number;
}
