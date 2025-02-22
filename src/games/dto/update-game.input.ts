import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Validate,
} from 'class-validator';
import { GameStatus, GameType } from 'src/common/constants';
import {
  IsFullDateString,
  IsValidDateRange,
  IsValidTimeFormat,
  IsValidTimeRange,
} from 'src/common/validators';

@InputType()
export class UpdateGamesDto {
  @Field(() => String, { nullable: false })
  @IsValidTimeFormat({ message: 'Start time must be in HH:MM:SS format.' })
  start_time: string;

  @Field(() => String, { nullable: false })
  @IsValidTimeFormat({ message: 'End time must be in HH:MM:SS format.' })
  @Validate(IsValidTimeRange, {
    message: 'End time must be greater than start time.',
  })
  end_time: string;

  @Field(() => Date, { nullable: false })
  @IsFullDateString({
    message: 'Start Date must be a valid ISO date string with seconds.',
  })
  start_date: Date;

  @Field(() => Date, { nullable: false })
  @IsFullDateString({
    message: 'End Date must be a valid ISO date string with seconds.',
  })
  @Validate(IsValidDateRange, {
    message:
      'End Date must be greater than start date, on the same date, and not the same time.',
  })
  end_date: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  game_duration?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Game in day must be a valid number.' })
  game_in_day?: number;

  @Field(() => GameType, { nullable: true })
  @IsOptional()
  @IsEnum(GameType, { message: 'Invalid game  type.' })
  game_type?: GameType;

  @Field(() => Int, { nullable: false })
  admin_id: number;

  @Field(() => Int, { nullable: false })
  @IsNotEmpty()
  game_id: number;

  @Field(() => GameStatus, { nullable: true })
  @IsOptional()
  @IsEnum(GameStatus, { message: 'Invalid game  status.' })
  game_status?: GameStatus;
}
