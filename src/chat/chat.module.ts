import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatmiddlewareMiddleware } from './chatmiddleware/chatmiddleware.middleware';

@Module({
  providers: [ChatGateway],
})
export class ChatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ChatmiddlewareMiddleware)
      .forRoutes({ path: 'http://localhost:3001/', method: RequestMethod.ALL });
  }
}
