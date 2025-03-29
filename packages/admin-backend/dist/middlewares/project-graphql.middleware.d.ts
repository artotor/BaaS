import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../redis/redis.service';
export declare class ProjectGraphqlMiddleware implements NestMiddleware {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    use(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    private testDatabaseConnection;
    private getConnectionString;
    private getOptions;
}
