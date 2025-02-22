import { Field, Int, ObjectType } from '@nestjs/graphql';
import { RecordSessionKqj } from '../dbrepo/record_session_kqj.repository';

@ObjectType()
export class RecordSessionKqjPagination {
  @Field(() => [RecordSessionKqj], { nullable: false })
  data: RecordSessionKqj[];

  @Field(() => Int, { nullable: false })
  totalSize: number;
}
