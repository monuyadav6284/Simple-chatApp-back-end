import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    this.users.set(client.id, client);
    this.server.emit('users', Array.from(this.users.keys()));
    console.log(`User connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
    this.server.emit('users', Array.from(this.users.keys()));
    console.log(`User disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { message: string; to: string }, @ConnectedSocket() client: Socket) {
    const recipientSocket = this.users.get(data.to);
    if (recipientSocket) {
      recipientSocket.emit('message', { message: data.message, from: client.id });
      console.log(`Message sent from ${client.id} to ${data.to}: ${data.message}`);
    } else {
      console.log(`User ${data.to} not connected`);
    }
  }
}
