import { DataSource } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
export declare class ProjectsService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    findAll(): Promise<Project[]>;
    findOne(id: number): Promise<Project>;
    createProject(createProjectDto: CreateProjectDto, userId?: number): Promise<Project>;
}
