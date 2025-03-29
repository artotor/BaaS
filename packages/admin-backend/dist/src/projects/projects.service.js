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
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../../entities/project.entity");
const user_entity_1 = require("../../entities/user.entity");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(ProjectsService_1.name);
    }
    async findAll() {
        this.logger.log('Obteniendo todos los proyectos');
        try {
            const projects = await this.dataSource
                .getRepository(project_entity_1.Project)
                .createQueryBuilder('project')
                .getMany();
            return projects;
        }
        catch (error) {
            this.logger.error(`Error al obtener proyectos: ${error.message}`);
            return [];
        }
    }
    async findOne(id) {
        this.logger.log(`Buscando proyecto con ID: ${id}`);
        const project = await this.dataSource
            .getRepository(project_entity_1.Project)
            .findOne({
            where: { id },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Proyecto con ID ${id} no encontrado`);
        }
        return project;
    }
    async createProject(createProjectDto, userId = 1) {
        this.logger.log(`Creando proyecto: ${createProjectDto.name}`);
        try {
            const user = await this.dataSource.getRepository(user_entity_1.User).findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            const timestamp = Date.now();
            const dbName = `acme_project_${timestamp}`;
            this.logger.log(`Nombre de base de datos generado: ${dbName}`);
            const newProject = this.dataSource.getRepository(project_entity_1.Project).create({
                name: createProjectDto.name,
                dbName,
                user,
            });
            const savedProject = await this.dataSource.getRepository(project_entity_1.Project).save(newProject);
            this.logger.log(`Proyecto guardado en la BD principal con ID: ${savedProject.id}`);
            this.logger.log(`Creando base de datos: ${dbName}`);
            await this.dataSource.query(`CREATE DATABASE ${dbName}`);
            this.logger.log(`Base de datos creada: ${dbName}`);
            const newDbConnection = new typeorm_2.DataSource({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: dbName,
                synchronize: false,
            });
            try {
                await newDbConnection.initialize();
                this.logger.log(`Conexión establecida con la nueva BD: ${dbName}`);
                await newDbConnection.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          -- Insertar datos de ejemplo para que GraphQL pueda consultarlos
          INSERT INTO users (name, email) 
          VALUES 
            ('Usuario Demo', 'demo@acme.com'),
            ('Admin', 'admin@acme.com');
            
          INSERT INTO products (name, description, price) 
          VALUES 
            ('Producto 1', 'Descripción del producto 1', 19.99),
            ('Producto 2', 'Descripción del producto 2', 29.99),
            ('Producto 3', 'Descripción del producto 3', 39.99);
        `);
                this.logger.log(`Tablas y datos de ejemplo creados en la BD: ${dbName}`);
                await newDbConnection.destroy();
                this.logger.log(`Conexión cerrada con la BD: ${dbName}`);
            }
            catch (error) {
                this.logger.error(`Error al crear tablas en la BD ${dbName}: ${error.message}`);
            }
            return savedProject;
        }
        catch (error) {
            this.logger.error(`Error al crear proyecto: ${error.message}`);
            throw error;
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map