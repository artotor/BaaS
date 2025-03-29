import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createProject(name: string, userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const newDbName = `acme_project_${Date.now()}`;
    await this.projectRepo.query(`CREATE DATABASE ${newDbName};`);
    await this.projectRepo.query(`
      CREATE TABLE ${newDbName}.public.users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE TABLE ${newDbName}.public.settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const project = this.projectRepo.create({ name, dbName: newDbName, user });
    await this.projectRepo.save(project);
    return project;
  }
}
