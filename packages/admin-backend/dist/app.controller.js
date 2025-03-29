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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const typeorm_1 = require("typeorm");
const pg_1 = require("pg");
let AppController = class AppController {
    constructor(appService, dataSource) {
        this.appService = appService;
        this.dataSource = dataSource;
    }
    getHello() {
        return this.appService.getHello();
    }
    async checkDatabase() {
        try {
            const connected = this.dataSource.isInitialized;
            const result = await this.dataSource.query('SELECT NOW() as time');
            return {
                status: 'success',
                connected,
                dbInfo: {
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    database: process.env.DB_NAME,
                    time: result[0].time,
                }
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                connected: false,
                details: {
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    database: process.env.DB_NAME
                }
            };
        }
    }
    async checkProjectDatabase(id) {
        try {
            const project = await this.dataSource.query('SELECT id, name, "dbName" FROM project WHERE id = $1', [id]);
            if (!project || project.length === 0) {
                return { status: 'error', message: 'Proyecto no encontrado' };
            }
            const dbName = project[0].dbName;
            const client = new pg_1.Client({
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432'),
                database: dbName,
            });
            await client.connect();
            const { rows: tables } = await client.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
            const { rows: users } = await client.query('SELECT COUNT(*) as count FROM users').catch(() => ({ rows: [{ count: 'tabla no existe' }] }));
            await client.end();
            return {
                status: 'success',
                project: project[0],
                tables: tables.map(t => t.tablename),
                userCount: users[0].count,
                connectionString: `postgres://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: error.message,
                details: error.stack
            };
        }
    }
    async repairProjectDatabase(id) {
        try {
            const project = await this.dataSource.query('SELECT id, name, "dbName" FROM project WHERE id = $1', [id]);
            if (!project || project.length === 0) {
                return { status: 'error', message: 'Proyecto no encontrado' };
            }
            const dbName = project[0].dbName;
            const client = new pg_1.Client({
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432'),
                database: dbName,
            });
            await client.connect();
            const { rows: tables } = await client.query('SELECT tablename FROM pg_tables WHERE schemaname = $1', ['public']);
            const tableNames = tables.map(t => t.tablename);
            const actions = [];
            if (!tableNames.includes('users')) {
                await client.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
                actions.push('Creada tabla users');
            }
            if (!tableNames.includes('products')) {
                await client.query(`
          CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
                actions.push('Creada tabla products');
            }
            const { rows: userCount } = await client.query('SELECT COUNT(*) as count FROM users');
            if (parseInt(userCount[0].count) === 0) {
                await client.query(`
          INSERT INTO users (name, email) 
          VALUES 
            ('Usuario Demo', 'demo@acme.com'),
            ('Admin', 'admin@acme.com');
        `);
                actions.push('Insertados datos de ejemplo en users');
            }
            const { rows: productCount } = await client.query('SELECT COUNT(*) as count FROM products');
            if (parseInt(productCount[0].count) === 0) {
                await client.query(`
          INSERT INTO products (name, description, price) 
          VALUES 
            ('Producto 1', 'Descripción del producto 1', 19.99),
            ('Producto 2', 'Descripción del producto 2', 29.99),
            ('Producto 3', 'Descripción del producto 3', 39.99);
        `);
                actions.push('Insertados datos de ejemplo en products');
            }
            await client.end();
            return {
                status: 'success',
                project: project[0],
                message: 'Base de datos reparada correctamente',
                actions: actions.length > 0 ? actions : ['No se requirieron reparaciones']
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: `Error al reparar la base de datos: ${error.message}`,
                details: error.stack
            };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('check-db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "checkDatabase", null);
__decorate([
    (0, common_1.Get)('check-project-db/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "checkProjectDatabase", null);
__decorate([
    (0, common_1.Get)('repair-project-db/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "repairProjectDatabase", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        typeorm_1.DataSource])
], AppController);
//# sourceMappingURL=app.controller.js.map