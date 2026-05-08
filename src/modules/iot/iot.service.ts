import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IoTReading, IoTReadingDocument } from './entities/iot-reading.entity';
import { IoTDataDto } from './dto/iot-data.dto';

@Injectable()
export class IoTService {
    private readonly logger = new Logger(IoTService.name);

    constructor(
        @InjectModel(IoTReading.name)
        private iotReadingModel: Model<IoTReadingDocument>,
    ) {}

    async saveReading(data: IoTDataDto): Promise<IoTReading> {
        this.logger.log(
            `Saving IoT reading from device: ${data.deviceId} | HR: ${data.heartRate} | SpO2: ${data.spo2} | Temp: ${data.temperature}`,
        );

        const reading = new this.iotReadingModel({
            deviceId: data.deviceId,
            heartRate: data.heartRate,
            spo2: data.spo2,
            temperature: data.temperature,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        });

        await reading.save();

        this.logger.log(`IoT reading saved: ${reading._id}`);

        return reading;
    }

    async getLatestReading(deviceId: string): Promise<IoTReading | null> {
        return this.iotReadingModel
            .findOne({ deviceId })
            .sort({ timestamp: -1 })
            .exec();
    }

    async getReadingsByDevice(
        deviceId: string,
        limit = 100,
    ): Promise<IoTReading[]> {
        return this.iotReadingModel
            .find({ deviceId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    }

    async getReadingsByChild(
        childId: string,
        limit = 100,
    ): Promise<IoTReading[]> {
        return this.iotReadingModel
            .find({ child: childId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .exec();
    }
}
