import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child, ChildDocument } from './entities/child.entity';
import { ImageUtil } from 'src/common/utils/image.util';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    ) { }

    async addPrediction(userId: string, prediction: string, confidence: number) {
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
        let child = await this.childModel.findOne({ identity: userId });

        if (avatar) {
            if (child?.avatar) {
                await ImageUtil.removeAvatar('children', child.avatar);
            }
            data.avatar = await ImageUtil.processAndSaveAvatar(
                avatar.buffer,
                'children',
            );
        }

        if (!child) {
            child = new this.childModel({
                identity: userId,
                ...data,
            });
        } else {
            Object.assign(child, data);
        }

        return child.save();
    }

    async getProfile(userId: string) {
        return this.childModel.findOne({ identity: userId });
    }

    async getPredictions(userId: string) {
        return this.childModel.findOne({ identity: userId });
    }
}
