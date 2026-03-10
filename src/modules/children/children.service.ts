import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child, ChildDocument } from './entities/child.entity';
import { ImageUtil } from 'src/common/utils/image.util';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class ChildrenService {
    constructor(
        @InjectModel(Child.name) private childModel: Model<ChildDocument>,
        private readonly returnObject: ReturnObject,
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

        await child.save();
        return this.returnObject.child(child);
    }

    async getProfile(userId: string) {
        const child = await this.childModel.findOne({ identity: userId });
        console.log('child=====================>', child);
        return this.returnObject.child(child);
    }

    async getPredictions(userId: string) {
        return this.childModel.findOne({ identity: userId });
    }
}
