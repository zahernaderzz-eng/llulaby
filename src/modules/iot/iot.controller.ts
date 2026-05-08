import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Logger,
    BadRequestException,
    Req,
} from '@nestjs/common';
import { IoTService } from './iot.service';
import { IoTDataDto } from './dto/iot-data.dto';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';

@Controller('iot')
export class IoTController {
    private readonly logger = new Logger(IoTController.name);

    constructor(private readonly iotService: IoTService) {}

    @UseGuards(AuthenticateGuardFactory())
    @Post('data')
    @HttpCode(HttpStatus.OK)
    async receiveData(@Body() data: IoTDataDto, @Req() req: any) {
        try {
            const userId = req['user']['id'];

            this.logger.log(
                `Received IoT data from device: ${data.deviceId} | user: ${userId}`,
            );

            await this.iotService.saveReading(data, userId);

            return {
                status: 200,
                message: 'Data received successfully',
            };
        } catch (error: any) {
            this.logger.error(`Failed to save IoT data: ${error?.message}`);
            throw new BadRequestException('Failed to save data');
        }
    }
}
