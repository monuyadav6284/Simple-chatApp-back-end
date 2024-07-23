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
import { ChatguardGuard } from './chatguard/chatguard.guard';
import { UseGuards } from '@nestjs/common';

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
  private groups: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.users.set(client.id, client);
    this.server.emit('users', Array.from(this.users.keys()));
    console.log(`User connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.users.delete(client.id);
    this.groups.forEach((members, group) => {
      if (members.has(client.id)) {
        members.delete(client.id);
        this.server.to(group).emit('groupUpdate', { group, members: Array.from(members) });
      }
    });
    this.server.emit('users', Array.from(this.users.keys()));
    console.log(`User disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { message: string; to: string, type: string }, @ConnectedSocket() client: Socket) {
    if (data.type === 'direct') {
      const recipientSocket = this.users.get(data.to);
      if (recipientSocket) {
        recipientSocket.emit('message', { message: data.message, from: client.id });
        console.log(`Message sent from ${client.id} to ${data.to}: ${data.message}`);
      } else {
        console.log(`User ${data.to} not connected`);
      }
    } else if (data.type === 'group') {
      const groupMembers = this.groups.get(data.to);
      if (groupMembers) {
        groupMembers.forEach(memberId => {
          if (memberId !== client.id) {
            const memberSocket = this.users.get(memberId);
            if (memberSocket) {
              memberSocket.emit('message', { message: data.message, from: client.id, group: data.to });
            }
          }
        });
        console.log(`Group message sent from ${client.id} to group ${data.to}: ${data.message}`);
      } else {
        console.log(`Group ${data.to} does not exist`);
      }
    }
  }


  @UseGuards(ChatguardGuard)
  @SubscribeMessage('joinGroup')
  handleJoinGroup(@MessageBody() data: { group: string }, @ConnectedSocket() client: Socket) {
    if (!this.groups.has(data.group)) {
      this.groups.set(data.group, new Set());
    }
    this.groups.get(data.group).add(client.id);
    client.join(data.group);
    this.server.to(data.group).emit('groupUpdate', { group: data.group, members: Array.from(this.groups.get(data.group)) });
    console.log(`User ${client.id} joined group ${data.group}`);
  }



  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(@MessageBody() data: { group: string }, @ConnectedSocket() client: Socket) {
    if(this.groups.has(data.group)) {
      const members = this.groups.get(data.group);
      if (members.has(client.id)) {
        members.delete(client.id);
        client.leave(data.group);
        this.server.to(data.group).emit('groupUpdate', { group: data.group, members: Array.from(members) });
        console.log(`User ${client.id} left group ${data.group}`);
      }
    }
  }


}

