import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../entities/admin.enitity';

export const adminsDbModule = MongooseModule.forFeature([
    {
        name: Admin.name,
        schema: AdminSchema,
    },
]);
