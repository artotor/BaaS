import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { ProjectGraphqlMiddleware } from './middlewares/project-graphql.middleware';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // 📂 Apunta a la carpeta public
      serveRoot: '/static', // 📌 Sirve archivos desde "/static"
    }),
    ConfigModule.forRoot(), // Para usar variables de entorno
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'acme_admin',
      entities: [User, Project],
      synchronize: true, // ❗ En producción, usa migraciones en lugar de `true`
    }),
    RedisModule,
    AuthModule,
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProjectGraphqlMiddleware)
      .forRoutes('projects/:projectId/graphql');
  }
}
