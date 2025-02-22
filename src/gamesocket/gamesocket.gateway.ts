import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { GamesocketService } from './gamesocket.service';
import { Server, Socket } from 'socket.io';
import { Bind, Injectable } from '@nestjs/common';
import { GameSessionStatus } from 'src/common/constants';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class GamesocketGateway implements OnGatewayConnection {
  constructor(private readonly gamesocketService: GamesocketService) {}
  private userSocketMap = new Map<string, Socket>();

  @WebSocketServer() server: Server;
  afterInit(server: Socket) {}

  handleConnection(socket: Socket) {
    let userId = socket.id;
    if (Array.isArray(userId)) {
      userId = userId[0]; // Use the first element of the array
    }
    if (typeof userId === 'string') {
      this.userSocketMap.set(userId, socket);
    }
    // const query = socket.handshake.query;
  }

  handleDisconnect(socket: Socket) {
    let userId = socket.handshake.query.userId;
    if (Array.isArray(userId)) {
      userId = userId[0];
    }
    if (typeof userId === 'string') {
      this.userSocketMap.delete(userId);
    }
  }

  broadcastEvent(event: string, payload: any) {
    this.server.emit(event, payload);
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('gameStart')
  async handleGameStart(
    @MessageBody() data: { sessionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('game is started');
    this.server.emit('gameStarted', data);
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('gameEnd')
  async handleGameEnd(
    @MessageBody() data: { sessionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // game end calculations
    // if result not exist create result
    // add data in transaction session
    // add data in transaction
    this.server.emit('gameEnded', data);
  }

  @Bind(MessageBody(), ConnectedSocket())
  @SubscribeMessage('gameResult')
  async handleGameResult(
    @MessageBody() data: { sessionId: number },
    @ConnectedSocket() client: Socket,
  ) {
    // game end calculations
    // if result not exist create result
    // add data in transaction session
    // add data in transaction
    this.server.emit('showResult', data);
  }
}
