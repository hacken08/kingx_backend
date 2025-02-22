import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TokenValues, TransactionType } from 'src/common/constants';

@InputType()
export class WalletDto {
  @Field(() => TokenValues)
  @IsNotEmpty({ message: 'Token is required' })
  @IsEnum(TokenValues, { message: 'Token must be a valid TokenValue' })
  token: number;

  @Field(() => TransactionType)
  @IsNotEmpty({ message: 'Transaction type is required' })
  @IsEnum(TransactionType, { message: "Type must be 'credit' or 'debit'" })
  type: TransactionType;
}
