import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nService } from 'nestjs-i18n';
import { AppValidationPipe } from './common/pipes/app-validation.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { useContainer } from 'class-validator';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });

    app.use(helmet());

    app.use((req: any, res: any, next: any) => {
        mongoSanitize.sanitize(req.body);
        mongoSanitize.sanitize(req.params);
        mongoSanitize.sanitize(req.query);
        next();
    });

    app.use(compression());

    app.useStaticAssets(join(__dirname, '..', 'public'));

    app.setGlobalPrefix('api');

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    const i18nService = app.get(I18nService);

    app.useGlobalPipes(new AppValidationPipe(i18nService));

    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running on port ${process.env.PORT ?? 3000}`);
}

void bootstrap();
