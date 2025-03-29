import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { RedisClientType } from 'redis';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly redisClient;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getClient(): RedisClientType;
}
