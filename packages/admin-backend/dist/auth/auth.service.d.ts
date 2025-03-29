import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(email: string, username: string, password: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string): Promise<{
        token: string;
    }>;
}
