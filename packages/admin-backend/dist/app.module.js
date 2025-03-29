"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const projects_module_1 = require("./src/projects/projects.module");
const path_1 = require("path");
const serve_static_1 = require("@nestjs/serve-static");
const user_entity_1 = require("./entities/user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const project_entity_1 = require("./entities/project.entity");
const config_1 = require("@nestjs/config");
const redis_module_1 = require("./redis/redis.module");
const project_graphql_middleware_1 = require("./middlewares/project-graphql.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(project_graphql_middleware_1.ProjectGraphqlMiddleware)
            .forRoutes('projects/:projectId/graphql');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
                serveRoot: '/static',
            }),
            config_1.ConfigModule.forRoot(),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT, 10) || 5432,
                username: process.env.DB_USER || 'user',
                password: process.env.DB_PASS || 'password',
                database: process.env.DB_NAME || 'acme_admin',
                entities: [user_entity_1.User, project_entity_1.Project],
                synchronize: true,
            }),
            redis_module_1.RedisModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map