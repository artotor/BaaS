import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
export declare class ProjectsController {
    private projectsService;
    private readonly logger;
    constructor(projectsService: ProjectsService);
    createProject(createProjectDto: CreateProjectDto, req: any): Promise<import("../../entities/project.entity").Project>;
    findAll(): Promise<import("../../entities/project.entity").Project[]>;
    findOne(id: number): Promise<import("../../entities/project.entity").Project>;
}
