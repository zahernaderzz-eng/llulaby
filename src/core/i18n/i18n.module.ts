import { I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { HeaderResolver } from 'nestjs-i18n';

export const i18nModule = I18nModule.forRoot({
    fallbackLanguage: 'ar',
    loaderOptions: {
        path: path.join(__dirname, '..', '..', 'locales'),
        watch: true,
    },
    resolvers: [new HeaderResolver(['lang'])],
});
