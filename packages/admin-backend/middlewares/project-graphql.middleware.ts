import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { postgraphile, makePluginHook, PostGraphilePlugin } from 'postgraphile';
import { getRepository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { RedisService } from '../redis/redis.service';
import { acmePlugin } from '../plugins/acme.plugin';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

// Configuración del plugin de PostGraphile
const pluginHook = makePluginHook([acmePlugin as PostGraphilePlugin]);

const getCacheKey = (dbName: string) => `postgraphile:${dbName}`;

@Injectable()
export class ProjectGraphqlMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProjectGraphqlMiddleware.name);

  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        this.logger.error('No project ID provided');
        return res.status(400).json({ error: 'Project ID is required' });
      }

      this.logger.log(`GraphQL request for project ID: ${projectId}`);

      // Buscar el proyecto en la BD administrativa
      const projectRepo = getRepository(Project);
      const project = await projectRepo.findOne({
        where: { id: parseInt(projectId, 10) },
      });
      
      if (!project) {
        this.logger.error(`Project with ID ${projectId} not found`);
        return res.status(404).json({ error: 'Project not found' });
      }

      this.logger.log(`Found project ${project.name} with database ${project.dbName}`);

      // Test database connection first
      await this.testDatabaseConnection(project.dbName);
      
      const connectionString = this.getConnectionString(project.dbName);
      this.logger.log(`Using connection string for ${project.dbName}`);
      
      const options = this.getOptions();
      this.logger.log(`Using GraphQL options with graphiql: ${options.graphiql}`);

      const middlewareInstance = postgraphile(
        connectionString,
        'public',
        {
          ...options,
          // Disable connection pooling to avoid issues with stale connections
          pgSettings: {
            'client_min_messages': 'WARNING',
          }
        },
      );

      this.logger.log(`Middleware created successfully, delegating request`);
      return middlewareInstance(req, res, next);
    } catch (error) {
      this.logger.error(`Error in GraphQL middleware: ${error.message}`);
      return res.status(500).json({ 
        error: 'Database connection error', 
        details: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }

  private async testDatabaseConnection(dbName: string): Promise<void> {
    const client = new Client({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: dbName,
    });

    try {
      this.logger.log(`Testing connection to database: ${dbName}`);
      await client.connect();
      
      // Verify tables exist
      const { rows } = await client.query(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
      `);
      
      this.logger.log(`Database ${dbName} tables: ${rows.map(r => r.tablename).join(', ')}`);
      
      if (rows.length === 0) {
        throw new Error(`No tables found in database ${dbName}`);
      }
      
      await client.end();
      this.logger.log(`Connection to database ${dbName} successful`);
    } catch (error) {
      await client.end().catch(() => {});
      this.logger.error(`Database connection test failed: ${error.message}`);
      throw error;
    }
  }

  private getConnectionString(dbName: string): string {
    return `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;
  }

  private getOptions() {
    return {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      extendedErrors: ['hint', 'detail', 'errcode'],
      showErrorStack: true,
      dynamicJson: true,
      enableCors: true,
      pluginHook,
    };
  }
}
