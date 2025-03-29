import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const server = express();
    server.use('/projects/:projectId/playground-acme', (req, res) => {
      res.sendFile(join(__dirname, '..', 'public', 'playground-acme.html'));
    });

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      },
    );

    // Configurar CORS para permitir peticiones desde el frontend
    app.enableCors({
      origin: ['http://localhost:3001', 'http://localhost:3002'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    // Middleware para log de todas las peticiones
    app.use((req, res, next) => {
      logger.log(`Petición recibida: ${req.method} ${req.originalUrl}`);
      next();
    });

    // Configurar prefijo global (opcional)
    // app.setGlobalPrefix('api');

    const port = process.env.PORT || 6868;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('Error starting application:', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
