import { MongooseModule } from '@nestjs/mongoose';
import { Vaccine, VaccineSchema } from '../entities/vaccine.entity';

export const vaccineDbModule = MongooseModule.forFeature([
    {
        name: Vaccine.name,
        schema: VaccineSchema,
    },
]);
