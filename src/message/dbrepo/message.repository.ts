import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Room } from 'src/room/dbrepo/room.repository';
import { User } from 'src/user/dbrepo/user.repository';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from 'src/common/repository/base.repository';
import { MessageType } from 'src/graphql';

registerEnumType(MessageType, { name: 'MessageType' });

@ObjectType()
@Entity({ name: 'message' })
export class Message extends BaseEntity {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;

  @ManyToOne(() => Room, (room) => room.messages)
  @JoinColumn({ name: 'room' })
  room: Room;

  @OneToOne(() => Room, (room) => room.latestMessage)
  @JoinColumn({ name: 'latestMessage' })
  latestMessage: Room;

  @Field(() => String, { nullable: false })
  @Column({ nullable: false, name: 'message', type: 'text' })
  message: string;

  @OneToOne(() => User, (user) => user.sender)
  @JoinColumn({ name: 'sender' })
  sender: User;

  @Field(() => MessageType, { nullable: false })
  @Column({
    type: 'enum',
    enum: MessageType,
    nullable: false,
    default: MessageType.MESSAGE,
  })
  messageType: MessageType;

  // @Field(() => MessageType, { nullable: false })
  // @Column({ type: "enum", enum: MessageStatus, nullable: false, default: MessageStatus.NONE })
  // messageStatus: MessageStatus

  @Field(() => String)
  @Column({ nullable: true, type: 'text' })
  imageUrl: string;
}
