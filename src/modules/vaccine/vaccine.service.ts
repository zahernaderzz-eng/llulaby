import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vaccine, VaccineDocument } from './entities/vaccine.entity';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class VaccineService {
    constructor(
        private readonly returnObject: ReturnObject,
        @InjectModel(Vaccine.name)
        private readonly vaccineModel: Model<VaccineDocument>,
    ) {}

    async create(createDto: any): Promise<VaccineDocument> {
        const created = new this.vaccineModel(createDto);
        return await created.save();
    }

    async findById(id: string, options?: { lean?: boolean }) {
        const query = this.vaccineModel.findById(id);
        if (options?.lean) query.lean();
        return await query.exec();
    }

    async getAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [vaccines, totalCount] = await Promise.all([
            this.vaccineModel.find().skip(skip).limit(limit),
            this.vaccineModel.countDocuments(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            vaccines,
            totalCount,
            totalPages,
        };
    }

    async update(id: string, updateDto: any) {
        return await this.vaccineModel.findByIdAndUpdate(id, updateDto, {
            new: true,
        });
    }

    async remove(id: string) {
        return await this.vaccineModel.findByIdAndDelete(id);
    }
}
