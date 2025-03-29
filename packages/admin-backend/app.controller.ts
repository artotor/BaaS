import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';
import { Client } from 'pg';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('check-db')
  async checkDatabase() {
    try {
      // Verificar la conexión a la base de datos principal
      const connected = this.dataSource.isInitialized;

      // Ejecutar una consulta simple para verificar que realmente funciona
      const result = await this.dataSource.query('SELECT NOW() as time');
      
      return {
        status: 'success',
        connected,
        dbInfo: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          time: result[0].time,
        }
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        connected: false,
        details: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME
        }
      };
    }
  }

  @Get('check-project-db/:id')
  async checkProjectDatabase(@Param('id', ParseIntPipe) id: number) {
    try {
      // Primero obtener el proyecto para saber el nombre de la base de datos
      const project = await this.dataSource.query(
        'SELECT id, name, "dbName" FROM project WHERE id = $1',
        [id]
      );

      if (!project || project.length === 0) {
        return { status: 'error', message: 'Proyecto no encontrado' };
      }

      const dbName = project[0].dbName;

      // Ahora probar la conexión a la base de datos del proyecto
      const client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: dbName,
      });

      await client.connect();
      
      // Consultar tablas
      const { rows: tables } = await client.query(
        'SELECT tablename FROM pg_tables WHERE schemaname = $1',
        ['public']
      );
      
      // Verificar si hay datos en la tabla users
      const { rows: users } = await client.query(
        'SELECT COUNT(*) as count FROM users'
      ).catch(() => ({ rows: [{ count: 'tabla no existe' }] }));
      
      await client.end();

      return {
        status: 'success',
        project: project[0],
        tables: tables.map(t => t.tablename),
        userCount: users[0].count,
        connectionString: `postgres://${process.env.DB_USER}:***@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        details: error.stack
      };
    }
  }

  @Get('repair-project-db/:id')
  async repairProjectDatabase(@Param('id', ParseIntPipe) id: number) {
    try {
      // Primero obtener el proyecto para saber el nombre de la base de datos
      const project = await this.dataSource.query(
        'SELECT id, name, "dbName" FROM project WHERE id = $1',
        [id]
      );

      if (!project || project.length === 0) {
        return { status: 'error', message: 'Proyecto no encontrado' };
      }

      const dbName = project[0].dbName;

      // Crear cliente para conectarse a la base de datos del proyecto
      const client = new Client({
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: dbName,
      });

      await client.connect();
      
      // Verificar si existen las tablas necesarias
      const { rows: tables } = await client.query(
        'SELECT tablename FROM pg_tables WHERE schemaname = $1',
        ['public']
      );
      
      const tableNames = tables.map(t => t.tablename);
      const actions = [];
      
      // Crear tabla users si no existe
      if (!tableNames.includes('users')) {
        await client.query(`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        actions.push('Creada tabla users');
      }
      
      // Crear tabla products si no existe
      if (!tableNames.includes('products')) {
        await client.query(`
          CREATE TABLE products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        actions.push('Creada tabla products');
      }
      
      // Insertar datos de ejemplo si las tablas están vacías
      const { rows: userCount } = await client.query('SELECT COUNT(*) as count FROM users');
      if (parseInt(userCount[0].count) === 0) {
        await client.query(`
          INSERT INTO users (name, email) 
          VALUES 
            ('Usuario Demo', 'demo@acme.com'),
            ('Admin', 'admin@acme.com');
        `);
        actions.push('Insertados datos de ejemplo en users');
      }
      
      const { rows: productCount } = await client.query('SELECT COUNT(*) as count FROM products');
      if (parseInt(productCount[0].count) === 0) {
        await client.query(`
          INSERT INTO products (name, description, price) 
          VALUES 
            ('Producto 1', 'Descripción del producto 1', 19.99),
            ('Producto 2', 'Descripción del producto 2', 29.99),
            ('Producto 3', 'Descripción del producto 3', 39.99);
        `);
        actions.push('Insertados datos de ejemplo en products');
      }
      
      await client.end();
      
      return {
        status: 'success',
        project: project[0],
        message: 'Base de datos reparada correctamente',
        actions: actions.length > 0 ? actions : ['No se requirieron reparaciones']
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Error al reparar la base de datos: ${error.message}`,
        details: error.stack
      };
    }
  }
}
