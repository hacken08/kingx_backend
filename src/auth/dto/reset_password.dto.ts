import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class ResetPasswordDto {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  @IsNotEmpty({ message: 'Current Password cannot be empty' })
  @IsString()
  @MinLength(8, {
    message: 'Current Password must be at least 8 characters long',
  })
  @MaxLength(30, {
    message: 'Current Password cannot be longer than 30 characters',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Current Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Current Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Current Password must contain at least one number',
  })
  @Matches(/(?=.*\W)/, {
    message: 'Current Password must contain at least one special character',
  })
  currentPassword: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'New Password cannot be empty' })
  @IsString()
  @MinLength(8, { message: 'New Password must be at least 8 characters long' })
  @MaxLength(30, {
    message: 'New Password cannot be longer than 30 characters',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'New Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'New Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'New Password must contain at least one number',
  })
  @Matches(/(?=.*\W)/, {
    message: 'New Password must contain at least one special character',
  })
  newPassword: string;

  @Field(() => String)
  @IsNotEmpty({ message: 'Confirm Password cannot be empty' })
  @IsString()
  @MinLength(8, {
    message: 'Confirm Password must be at least 8 characters long',
  })
  @MaxLength(30, {
    message: 'Confirm Password cannot be longer than 30 characters',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Confirm Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[a-z])/, {
    message: 'Confirm Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Confirm Password must contain at least one number',
  })
  @Matches(/(?=.*\W)/, {
    message: 'Confirm Password must contain at least one special character',
  })
  confirmPassword: string;
}
