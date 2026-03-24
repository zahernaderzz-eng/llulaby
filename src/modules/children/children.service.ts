import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child, ChildDocument } from './entities/child.entity';
import { ChildVaccineService } from 'src/modules/vaccine/child-vaccine.service';
import { ImageUtil } from 'src/common/utils/image.util';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectModel(Child.name) private childModel: Model<ChildDocument>,
        private readonly returnObject: ReturnObject,
        private readonly childVaccineService: ChildVaccineService,
    ) {}

    async addPrediction(
        userId: string,
        prediction: string,
        confidence: number,
    ) {
        let child = await this.childModel.findOne({ identity: userId });

        if (!child) {
            child = new this.childModel({
                identity: userId,
                predictions: [],
            });
        }

        child.predictions.push({
            prediction,
            confidence,
            createdAt: new Date(),
        });

        return child.save();
    }

    async create(userId: string, data: any, avatar?: Express.Multer.File) {
        const existing = await this.childModel.findOne({ identity: userId });
        if (existing) throw new BadRequestException('Child already exists');

        if (avatar) {
            data.avatar = await ImageUtil.processAndSaveAvatar(
                avatar.buffer,
                'children',
            );
        }

        const child = new this.childModel({ identity: userId, ...data });
        await child.save();

        try {
            await this.childVaccineService.generateForChild(
                (child as any)._id.toString(),
                child.dateBirth,
            );
        } catch (e) {
            console.error('Failed to generate child vaccines', e);
        }

        return this.returnObject.child(child);
    }

    async update(userId: string, data: any, avatar?: Express.Multer.File) {
        const child = await this.childModel.findOne({ identity: userId });
        if (!child) throw new NotFoundException('Child not found');

        if (avatar) {
            if (child?.avatar) {
                await ImageUtil.removeAvatar('children', child.avatar);
            }
            data.avatar = await ImageUtil.processAndSaveAvatar(
                avatar.buffer,
                'children',
            );
        }

        Object.assign(child, data);
        await child.save();

        return this.returnObject.child(child);
    }

    async getProfile(userId: string) {
        const child = await this.childModel.findOne({ identity: userId });
        return this.returnObject.child(child);
    }

    async getPredictions(userId: string) {
        return this.childModel.findOne({ identity: userId });
    }

    async findOne(userId: string) {
        return this.childModel.findOne({ identity: userId });
    }
}
