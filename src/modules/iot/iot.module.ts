import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IoTController } from './iot.controller';
import { IoTService } from './iot.service';
import { IoTReading, IoTReadingSchema } from './entities/iot-reading.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: IoTReading.name, schema: IoTReadingSchema },
        ]),
    ],
    controllers: [IoTController],
    providers: [IoTService],
    exports: [IoTService],
})
export class IoTModule {}
