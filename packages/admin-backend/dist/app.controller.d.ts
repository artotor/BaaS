import { AppService } from './app.service';
import { DataSource } from 'typeorm';
export declare class AppController {
    private readonly appService;
    private readonly dataSource;
    constructor(appService: AppService, dataSource: DataSource);
    getHello(): string;
    checkDatabase(): Promise<{
        status: string;
        connected: boolean;
        dbInfo: {
            host: string;
            port: string;
            database: string;
            time: any;
        };
        message?: undefined;
        details?: undefined;
    } | {
        status: string;
        message: any;
        connected: boolean;
        details: {
            host: string;
            port: string;
            database: string;
        };
        dbInfo?: undefined;
    }>;
    checkProjectDatabase(id: number): Promise<{
        status: string;
        message: string;
        project?: undefined;
        tables?: undefined;
        userCount?: undefined;
        connectionString?: undefined;
        details?: undefined;
    } | {
        status: string;
        project: any;
        tables: any;
        userCount: any;
        connectionString: string;
        message?: undefined;
        details?: undefined;
    } | {
        status: string;
        message: any;
        details: any;
        project?: undefined;
        tables?: undefined;
        userCount?: undefined;
        connectionString?: undefined;
    }>;
    repairProjectDatabase(id: number): Promise<{
        status: string;
        message: string;
        project?: undefined;
        actions?: undefined;
        details?: undefined;
    } | {
        status: string;
        project: any;
        message: string;
        actions: any[];
        details?: undefined;
    } | {
        status: string;
        message: string;
        details: any;
        project?: undefined;
        actions?: undefined;
    }>;
}
