import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = request.headers['x-api-key'];

        const validApiKey = this.configService.get<string>('IOT_API_KEY');

        if (!apiKey || apiKey !== validApiKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        return true;
    }
}
