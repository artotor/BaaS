import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
  Logger,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  private readonly logger = new Logger(ProjectsController.name);

  constructor(private projectsService: ProjectsService) {
    this.logger.log('ProjectsController iniciado');
  }

  @Post()
  async createProject(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    this.logger.log(`Creando proyecto: ${createProjectDto.name}`);
    const userId = req.user?.id || 1; // Temporalmente usar ID 1 si no hay usuario en la sesión
    return this.projectsService.createProject(createProjectDto, userId);
  }

  @Get()
  async findAll() {
    this.logger.log('Método findAll ejecutado');
    try {
      const projects = await this.projectsService.findAll();
      this.logger.log(`Proyectos encontrados: ${projects.length}`);
      return projects;
    } catch (error) {
      this.logger.error(`Error en findAll: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Obteniendo proyecto con ID: ${id}`);
    return this.projectsService.findOne(id);
  }
}
