import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from './entities/device.entity';
import { Model } from 'mongoose';

@Injectable()
export class DevicesService {
    constructor(
        @InjectModel(Device.name) private readonly deviceModel: Model<Device>,
    ) {}

    async create(data: { fcmToken: string; deviceType: string; user: string }) {
        return await this.deviceModel.create(data);
    }

    async findOne(filter: any) {
        return await this.deviceModel.findOne(filter);
    }

    async find(filter: any, options?: { populate?: any; lean?: boolean }) {
        const query = this.deviceModel.find(filter);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async deleteMany(filter: any) {
        await this.deviceModel.deleteMany(filter);
    }
}
