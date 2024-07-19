import { ChatmiddlewareMiddleware } from './chatmiddleware.middleware';

describe('ChatmiddlewareMiddleware', () => {
  it('should be defined', () => {
    expect(new ChatmiddlewareMiddleware()).toBeDefined();
  });
});
