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
var ProjectsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const create_project_dto_1 = require("./dto/create-project.dto");
let ProjectsController = ProjectsController_1 = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
        this.logger = new common_1.Logger(ProjectsController_1.name);
        this.logger.log('ProjectsController iniciado');
    }
    async createProject(createProjectDto, req) {
        var _a;
        this.logger.log(`Creando proyecto: ${createProjectDto.name}`);
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1;
        return this.projectsService.createProject(createProjectDto, userId);
    }
    async findAll() {
        this.logger.log('Método findAll ejecutado');
        try {
            const projects = await this.projectsService.findAll();
            this.logger.log(`Proyectos encontrados: ${projects.length}`);
            return projects;
        }
        catch (error) {
            this.logger.error(`Error en findAll: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
        this.logger.log(`Obteniendo proyecto con ID: ${id}`);
        return this.projectsService.findOne(id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createProject", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
exports.ProjectsController = ProjectsController = ProjectsController_1 = __decorate([
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map