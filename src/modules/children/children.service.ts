import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Child, ChildDocument } from './entities/child.entity';

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

    async create(userId: string, data: any) {
        let child = await this.childModel.findOne({ identity: userId });

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

    async getPredictions(userId: string) {
        return this.childModel.findOne({ identity: userId });
    }
}
