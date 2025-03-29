import { Project } from './project.entity';
export declare class User {
    id: number;
    email: string;
    username: string;
    password: string;
    projects: Project[];
}
