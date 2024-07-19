import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { ChatModule } from './chat/chat.module';
import { ChatmiddlewareMiddleware } from './chat/chatmiddleware/chatmiddleware.middleware';

@Module({
  imports: [ChatModule],
  controllers: [AppController],
  providers: [AppService, ChatGateway,ChatmiddlewareMiddleware],
})
export class AppModule {}
