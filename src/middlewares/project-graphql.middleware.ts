import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { postgraphile, makePluginHook, PostGraphilePlugin } from 'postgraphile';
import { getRepository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { RedisService } from '../redis/redis.service';
import { acmePlugin } from '../plugins/acme.plugin';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuración del plugin de PostGraphile
const pluginHook = makePluginHook([acmePlugin as PostGraphilePlugin]);

const getCacheKey = (dbName: string) => `postgraphile:${dbName}`;

@Injectable()
export class ProjectGraphqlMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { projectId } = req.params;
    if (!projectId) return next();

    // Buscar el proyecto en la BD administrativa
    const projectRepo = getRepository(Project);
    const project = await projectRepo.findOne({
      where: { id: parseInt(projectId, 10) },
    });
    if (!project) return res.status(404).send('Project no encontrado');

    const cacheKey = getCacheKey(project.dbName);
    let middlewareInstance: any;

    // Usar Redis para determinar si ya se creó la instancia
    const redisClient = this.redisService.getClient();
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      middlewareInstance = postgraphile(
        this.getConnectionString(project.dbName),
        'public',
        this.getOptions(),
      );
    } else {
      middlewareInstance = postgraphile(
        this.getConnectionString(project.dbName),
        'public',
        this.getOptions(),
      );
      // Marcar en Redis con una expiración de 1 hora
      await redisClient.setEx(cacheKey, 3600, 'true');
    }

    return middlewareInstance(req, res, next);
  }

  private getConnectionString(dbName: string): string {
    return `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;
  }

  private getOptions() {
    return {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      extendedErrors: [],
      pluginHook,
    };
  }
}
