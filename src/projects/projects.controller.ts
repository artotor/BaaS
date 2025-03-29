import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async createProject(@Body() body: { name: string }, @Req() req) {
    const userId = req.user?.id; // Obtener userId desde el token (implementa un guard para extraerlo)
    return this.projectsService.createProject(body.name, userId);
  }
}
