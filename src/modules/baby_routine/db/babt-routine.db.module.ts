import { MongooseModule } from '@nestjs/mongoose';
import {
    PhysicalGrowth,
    PhysicalGrowthSchema,
} from '../entities/physical-growth.entity';
import {
    MotorDevelopment,
    MotorDevelopmentSchema,
} from '../entities/motor-development.entity';
import { Feeding, FeedingSchema } from '../entities/feeding-entity';

export const babtRoutineDbModule = MongooseModule.forFeature([
    {
        name: PhysicalGrowth.name,
        schema: PhysicalGrowthSchema,
    },
    {
        name: MotorDevelopment.name,
        schema: MotorDevelopmentSchema,
    },
    {
        name: Feeding.name,
        schema: FeedingSchema,
    },
]);
