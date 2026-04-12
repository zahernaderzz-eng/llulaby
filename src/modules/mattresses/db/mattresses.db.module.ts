import { MongooseModule } from '@nestjs/mongoose';
import { Mattress, MattressSchema } from '../entities/mattress.entity';
import { Favorite, FavoriteSchema } from '../entities/favorite.entity';

export const MattressesDbModule = MongooseModule.forFeature([
    { name: Mattress.name, schema: MattressSchema },
    { name: Favorite.name, schema: FavoriteSchema },
]);
