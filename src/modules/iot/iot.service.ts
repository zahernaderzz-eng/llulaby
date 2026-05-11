import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IoTReading, IoTReadingDocument } from './entities/iot-reading.entity';
import { IoTDataDto } from './dto/iot-data.dto';
import { ChildrenService } from '../children/children.service';
import { SocketIoGateway } from '../../core/socket-io/socket-io-gateway';

@Injectable()
export class IoTService {
    private readonly logger = new Logger(IoTService.name);

    constructor(
        @InjectModel(IoTReading.name)
        private iotReadingModel: Model<IoTReadingDocument>,
        private childrenService: ChildrenService,
        private socketGateway: SocketIoGateway,
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

        // إرسال البيانات عبر Socket للمستخدم
        this.emitSensorDataToUser(userId, reading);

        return reading;
    }

    /**
     * إرسال بيانات السينسورات للمستخدم عبر Socket
     */
    private emitSensorDataToUser(userId: string, reading: IoTReading): void {
        try {
            const socket = this.socketGateway.getUserSocket(userId);
            if (socket) {
                const childId =
                    typeof reading.child === 'string'
                        ? reading.child
                        : reading.child
                          ? (reading.child as any)._id?.toString() ||
                            (reading.child as any).toString()
                          : null;

                socket.emit('sensor-data', {
                    deviceId: reading.deviceId,
                    childId: childId,
                    heartRate: reading.heartRate,
                    spo2: reading.spo2,
                    temperature: reading.temperature,
                    timestamp: reading.timestamp,
                });
                this.logger.log(`Sensor data emitted to user: ${userId}`);
            } else {
                this.logger.debug(`User ${userId} not connected via socket`);
            }
        } catch (error) {
            this.logger.error(
                `Failed to emit sensor data to user ${userId}: ${error.message}`,
            );
        }
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

    async getLatestReadingByUser(userId: string): Promise<IoTReading | null> {
        this.logger.log(
            `🔍 [IoTService] Getting latest reading for user: ${userId}`,
        );

        const child = await this.childrenService.findOne(userId);

        if (!child) {
            this.logger.warn(
                `⚠️ [IoTService] No child found for user: ${userId}`,
            );
            return null;
        }

        const childId = (child as any)._id.toString();
        this.logger.log(`👶 [IoTService] Child ID: ${childId}`);

        const reading = await this.iotReadingModel
            .findOne({ child: childId })
            .sort({ timestamp: -1 })
            .exec();

        if (reading) {
            this.logger.log(`✅ [IoTService] Reading found:`, {
                id: (reading as any)._id,
                deviceId: reading.deviceId,
                heartRate: reading.heartRate,
                spo2: reading.spo2,
                temperature: reading.temperature,
                timestamp: reading.timestamp,
            });
        } else {
            this.logger.warn(
                `⚠️ [IoTService] No readings found for child: ${childId}`,
            );
        }

        return reading;
    }
}
