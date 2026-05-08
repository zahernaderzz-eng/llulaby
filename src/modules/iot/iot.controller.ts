import {
    Controller,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { IoTService } from './iot.service';
import { IoTDataDto } from './dto/iot-data.dto';
import { ApiKeyGuard } from './guards/api-key.guard';

@Controller('iot')
export class IoTController {
    private readonly logger = new Logger(IoTController.name);

    constructor(private readonly iotService: IoTService) {}

    @UseGuards(ApiKeyGuard)
    @Post('data')
    @HttpCode(HttpStatus.OK)
    async receiveData(@Body() data: IoTDataDto) {
        try {
            this.logger.log(
                `Received IoT data from device: ${data.deviceId}`,
            );

            await this.iotService.saveReading(data);

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
