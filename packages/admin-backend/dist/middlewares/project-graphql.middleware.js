"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProjectGraphqlMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectGraphqlMiddleware = void 0;
const common_1 = require("@nestjs/common");
const postgraphile_1 = require("postgraphile");
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../entities/project.entity");
const redis_service_1 = require("../redis/redis.service");
const acme_plugin_1 = require("../plugins/acme.plugin");
const dotenv = require("dotenv");
const pg_1 = require("pg");
dotenv.config();
const pluginHook = (0, postgraphile_1.makePluginHook)([acme_plugin_1.acmePlugin]);
const getCacheKey = (dbName) => `postgraphile:${dbName}`;
let ProjectGraphqlMiddleware = ProjectGraphqlMiddleware_1 = class ProjectGraphqlMiddleware {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(ProjectGraphqlMiddleware_1.name);
    }
    async use(req, res, next) {
        try {
            const { projectId } = req.params;
            if (!projectId) {
                this.logger.error('No project ID provided');
                return res.status(400).json({ error: 'Project ID is required' });
            }
            this.logger.log(`GraphQL request for project ID: ${projectId}`);
            const projectRepo = (0, typeorm_1.getRepository)(project_entity_1.Project);
            const project = await projectRepo.findOne({
                where: { id: parseInt(projectId, 10) },
            });
            if (!project) {
                this.logger.error(`Project with ID ${projectId} not found`);
                return res.status(404).json({ error: 'Project not found' });
            }
            this.logger.log(`Found project ${project.name} with database ${project.dbName}`);
            await this.testDatabaseConnection(project.dbName);
            const connectionString = this.getConnectionString(project.dbName);
            this.logger.log(`Using connection string for ${project.dbName}`);
            const options = this.getOptions();
            this.logger.log(`Using GraphQL options with graphiql: ${options.graphiql}`);
            const middlewareInstance = (0, postgraphile_1.postgraphile)(connectionString, 'public', Object.assign(Object.assign({}, options), { pgSettings: {
                    'client_min_messages': 'WARNING',
                } }));
            this.logger.log(`Middleware created successfully, delegating request`);
            return middlewareInstance(req, res, next);
        }
        catch (error) {
            this.logger.error(`Error in GraphQL middleware: ${error.message}`);
            return res.status(500).json({
                error: 'Database connection error',
                details: error.message,
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            });
        }
    }
    async testDatabaseConnection(dbName) {
        const client = new pg_1.Client({
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            database: dbName,
        });
        try {
            this.logger.log(`Testing connection to database: ${dbName}`);
            await client.connect();
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
        }
        catch (error) {
            await client.end().catch(() => { });
            this.logger.error(`Database connection test failed: ${error.message}`);
            throw error;
        }
    }
    getConnectionString(dbName) {
        return `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;
    }
    getOptions() {
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
};
exports.ProjectGraphqlMiddleware = ProjectGraphqlMiddleware;
exports.ProjectGraphqlMiddleware = ProjectGraphqlMiddleware = ProjectGraphqlMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ProjectGraphqlMiddleware);
//# sourceMappingURL=project-graphql.middleware.js.map