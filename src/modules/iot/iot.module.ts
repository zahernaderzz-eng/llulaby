import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IoTController } from './iot.controller';
import { IoTService } from './iot.service';
import { IoTReading, IoTReadingSchema } from './entities/iot-reading.entity';
import { IdentitiesModule } from '../identities/identities.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';
import { ChildrenModule } from '../children/children.module';
import { SocketIoModule } from '../../core/socket-io/socket-io.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: IoTReading.name, schema: IoTReadingSchema },
        ]),
        IdentitiesModule,
        UserTokensModule,
        ChildrenModule,
        SocketIoModule,
    ],
    controllers: [IoTController],
    providers: [IoTService],
    exports: [IoTService],
})
export class IoTModule {}
