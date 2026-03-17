import { MongooseModule } from '@nestjs/mongoose';
import { Vaccine, VaccineSchema } from '../entities/vaccine.entity';
import {
    ChildVaccine,
    ChildVaccineSchema,
} from '../entities/child-vaccine.entity';

export const vaccineDbModule = MongooseModule.forFeature([
    {
        name: Vaccine.name,
        schema: VaccineSchema,
    },
    {
        name: ChildVaccine.name,
        schema: ChildVaccineSchema,
    },
]);
