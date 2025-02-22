import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';

@InputType()
export class PaginationMetadataDto {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  count?: number;

  @Field(() => Int)
  @IsNotEmpty()
  take: number;

  @Field(() => Int)
  @IsNotEmpty()
  skip: number;
}
