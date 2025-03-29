import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';
export declare class ProjectsService {
    private projectRepo;
    private userRepo;
    constructor(projectRepo: Repository<Project>, userRepo: Repository<User>);
    createProject(name: string, userId: number): Promise<Project>;
}
