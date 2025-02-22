import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role, UserStatus } from 'src/common/constants/enums';

@InputType()
export class UpdateUserDto {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  address?: string;

  @Field(() => Role, { nullable: true })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @Field(() => String, { nullable: true })
  @IsOptional()
  city?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  phone_number?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  otp?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Username must be at least 8 characters long' })
  @MaxLength(30, { message: 'Username cannot be longer than 30 characters' })
  username?: string;

  @Field(() => UserStatus, { nullable: true })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  first_time_password_reset?: boolean;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  wallet_limit?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  wallet?: number;
}
