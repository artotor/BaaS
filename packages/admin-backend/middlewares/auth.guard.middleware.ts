import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthGuardMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token =
      (authHeader && authHeader.split(' ')[1]) || req.cookies?.token;
    if (!token) {
      return res.redirect('/login');
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      return res.redirect('/login');
    }
  }
}
