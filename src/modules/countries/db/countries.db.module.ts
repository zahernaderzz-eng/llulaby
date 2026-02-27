import { MongooseModule } from '@nestjs/mongoose';
import { Country, CountrySchema } from '../entities/country.entity';

export const countriesDbModule = MongooseModule.forFeature([
    {
        name: Country.name,
        schema: CountrySchema,
    },
]);
