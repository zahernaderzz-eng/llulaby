import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { devicesDbModule } from './db/devices.db.module';

@Module({
    imports: [devicesDbModule],
    providers: [DevicesService],
    exports: [DevicesService, devicesDbModule],
})
export class DevicesModule {}
