import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    createProject(body: {
        name: string;
    }, req: any): Promise<import("../entities/project.entity").Project>;
}
