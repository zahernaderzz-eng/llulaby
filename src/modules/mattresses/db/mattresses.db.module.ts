import { MongooseModule } from '@nestjs/mongoose';
import { Mattress, MattressSchema } from '../entities/mattress.entity';

export const MattressesDbModule = MongooseModule.forFeature([
    { name: Mattress.name, schema: MattressSchema },
]);
