import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ChatmiddlewareMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...', req.body);
    console.log(" this is middlewear second");

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      console.log('Token:', token);
      if (token === '123') {
        console.log('Verify user');
        next();
      } else {
        throw new UnauthorizedException('User not valid');
      }
    }
  }
}
