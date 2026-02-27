import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const databaseRootModule = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        uri:
            configService.get<string>('DB_URI') ??
            'mongodb://localhost:27017/nest-base',
    }),
});
