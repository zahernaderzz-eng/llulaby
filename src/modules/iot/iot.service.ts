import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
            `Saving IoT reading from device: ${data.deviceId} | user: ${userId} | HR: ${data.heartRate} | SpO2: ${data.spo2} | Temp: ${data.temperature}`,
        );

        // Get child ID
        let childId: string | undefined;

        if (data.childId) {
            // Use provided childId
            childId = data.childId;
        } else {
            // Get first child for this user
            const children = await this.childrenService.findAll(userId);
            if (children && children.length > 0) {
                childId = children[0]._id.toString();
            }
        }

        const reading = new this.iotReadingModel({
            deviceId: data.deviceId,
            child: childId,
            heartRate: data.heartRate,
            spo2: data.spo2,
            temperature: data.temperature,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        });

        await reading.save();

        this.logger.log(
            `IoT reading saved: ${reading._id} | child: ${childId || 'none'}`,
        );

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
