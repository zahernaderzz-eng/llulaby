import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { countriesDbModule } from './db/countries.db.module';

@Module({
    imports: [countriesDbModule],
    controllers: [CountriesController],
    providers: [CountriesService],
    exports: [CountriesService, countriesDbModule],
})
export class CountriesModule {}
