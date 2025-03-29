import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Project } from '../../entities/project.entity';
import { User } from '../../entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findAll() {
    this.logger.log('Obteniendo todos los proyectos');
    
    try {
      // Primero intentar obtener proyectos sin relaciones
      const projects = await this.dataSource
        .getRepository(Project)
        .createQueryBuilder('project')
        .getMany();
        
      return projects;
    } catch (error) {
      this.logger.error(`Error al obtener proyectos: ${error.message}`);
      return [];
    }
  }

  async findOne(id: number) {
    this.logger.log(`Buscando proyecto con ID: ${id}`);
    
    const project = await this.dataSource
      .getRepository(Project)
      .findOne({
        where: { id },
      });
      
    if (!project) {
      throw new NotFoundException(`Proyecto con ID ${id} no encontrado`);
    }
    
    return project;
  }

  async createProject(createProjectDto: CreateProjectDto, userId: number = 1) {
    this.logger.log(`Creando proyecto: ${createProjectDto.name}`);
    
    try {
      // Verificar si el usuario existe
      const user = await this.dataSource.getRepository(User).findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Generar un nombre único para la base de datos
      const timestamp = Date.now();
      const dbName = `acme_project_${timestamp}`;
      this.logger.log(`Nombre de base de datos generado: ${dbName}`);

      // Crear el proyecto en la base de datos principal
      const newProject = this.dataSource.getRepository(Project).create({
        name: createProjectDto.name,
        dbName,
        user,
      });

      // Guardar el proyecto
      const savedProject = await this.dataSource.getRepository(Project).save(newProject);
      this.logger.log(`Proyecto guardado en la BD principal con ID: ${savedProject.id}`);

      // Crear la base de datos
      this.logger.log(`Creando base de datos: ${dbName}`);
      await this.dataSource.query(`CREATE DATABASE ${dbName}`);
      this.logger.log(`Base de datos creada: ${dbName}`);

      // Conectar a la nueva base de datos y crear las tablas necesarias
      const newDbConnection = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: dbName,
        synchronize: false,
      });

      try {
        // Inicializar la conexión
        await newDbConnection.initialize();
        this.logger.log(`Conexión establecida con la nueva BD: ${dbName}`);

        // Crear las tablas básicas con datos de ejemplo
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

        // Cerrar la conexión
        await newDbConnection.destroy();
        this.logger.log(`Conexión cerrada con la BD: ${dbName}`);
      } catch (error) {
        this.logger.error(`Error al crear tablas en la BD ${dbName}: ${error.message}`);
        // No lanzamos el error para no interrumpir el proceso, ya que la BD ya fue creada
      }

      return savedProject;
    } catch (error) {
      this.logger.error(`Error al crear proyecto: ${error.message}`);
      throw error;
    }
  }
}
