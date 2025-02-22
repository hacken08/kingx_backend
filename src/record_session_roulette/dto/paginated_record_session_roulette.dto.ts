import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RecordSessionRoulette } from '../dbrepo/record-session-roulette.repository';

@ObjectType()
export class RecordSessionRoulettePagination {
  @Field(() => [RecordSessionRoulette], { nullable: false })
  data: RecordSessionRoulette[];

  @Field(() => Int, { nullable: false })
  totalSize: number;
}
