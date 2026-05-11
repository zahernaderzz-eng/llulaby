import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IoTReading, IoTReadingDocument } from './entities/iot-reading.entity';
import { IoTDataDto } from './dto/iot-data.dto';
import { ChildrenService } from '../children/children.service';

@Injectable()
export class IoTService {
    private readonly logger = new Logger(IoTService.name);

    constructor(
        @InjectModel(IoTReading.name)
        private iotReadingModel: Model<IoTReadingDocument>,
        private childrenService: ChildrenService,
    ) {}

    async saveReading(data: IoTDataDto, userId: string): Promise<IoTReading> {
        this.logger.log(
            `Saving IoT reading from device: ${data.deviceId} | user: ${userId}`,
        );

        let childId: string | undefined;

        if (data.childId) {
            childId = data.childId;
        } else {
            const child = await this.childrenService.findOne(userId);

            if (child) {
                childId = (child as any)._id.toString();
            }
        }

        const reading = await this.iotReadingModel.findOneAndUpdate(
            {
                child: childId,
                deviceId: data.deviceId,
            }, // condition
            {
                $set: {
                    heartRate: data.heartRate,
                    spo2: data.spo2,
                    temperature: data.temperature,
                    timestamp: data.timestamp
                        ? new Date(data.timestamp)
                        : new Date(),
                },
            },
            {
                new: true,
                upsert: true,
            },
        );

        this.logger.log(`IoT reading upserted: ${(reading as any)._id}`);

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
