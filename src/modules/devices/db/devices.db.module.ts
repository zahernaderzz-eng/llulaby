import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from '../entities/device.entity';

export const devicesDbModule = MongooseModule.forFeature([
    { name: Device.name, schema: DeviceSchema },
]);
