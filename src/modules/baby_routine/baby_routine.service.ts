import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PhysicalGrowth } from './entities/physical-growth.entity';
import { Model } from 'mongoose';
import { CreatePhysicalGrowthDto } from './dtos/create-physical-growth.dto';
import { ReturnObject } from 'src/common/return-object/return-object';
import { AppException } from 'src/common/exceptions/app.exception';
import { I18nService } from 'nestjs-i18n';
import { MotorDevelopment } from './entities/motor-development.entity';
import { CreateMotorDevelopmentDto } from './dtos/create-motor-development.dto';
import { Feeding } from './entities/feeding-entity';
import { CreateFeedingDto } from './dtos/create-feeding.dto';

@Injectable()
export class BabyRoutineService {
    constructor(
        @InjectModel(PhysicalGrowth.name)
        private physicalGrowthModel: Model<PhysicalGrowth>,
        @InjectModel(MotorDevelopment.name)
        private motorDevelopmentModel: Model<MotorDevelopment>,
        @InjectModel(Feeding.name)
        private feedingModel: Model<Feeding>,

        private readonly returnObject: ReturnObject,
        private readonly i18nService: I18nService,
    ) {}

    async createPhysicalGrowth(dto: CreatePhysicalGrowthDto) {
        return this.physicalGrowthModel.create(dto);
    }

    async createMotorDevelopment(dto: CreateMotorDevelopmentDto) {
        return this.motorDevelopmentModel.create(dto);
    }
    async createFeeding(dto: CreateFeedingDto) {
        return this.feedingModel.create(dto);
    }

    async getPhysicalGrowth(month: number, lang: string) {
        if (!month)
            throw new AppException(
                this.i18nService.t('messages.monthRequired'),
                400,
            );
        if (month > 24 || month < 1)
            throw new AppException(
                this.i18nService.t('messages.invalidMonth'),
                400,
            );

        const data = await this.physicalGrowthModel
            .findOne({
                minMonth: { $lte: month },
                maxMonth: { $gte: month },
            })
            .lean()
            .exec();

        if (!data)
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                400,
            );

        return this.returnObject.physicalGrowth(data, lang);
    }

    async getMotorDevelopment(month: number, lang: string) {
        if (!month)
            throw new AppException(
                this.i18nService.t('messages.monthRequired'),
                400,
            );
        if (month > 24 || month < 1)
            throw new AppException(
                this.i18nService.t('messages.invalidMonth'),
                400,
            );

        const data = await this.motorDevelopmentModel
            .findOne({
                minMonth: { $lte: month },
                maxMonth: { $gte: month },
            })
            .lean()
            .exec();

        return this.returnObject.motorDevelopment(data, lang);
    }
    async getFeeding(month: number, lang: string) {
        if (!month)
            throw new AppException(
                this.i18nService.t('messages.monthRequired'),
                400,
            );

        if (month > 24 || month < 1)
            throw new AppException(
                this.i18nService.t('messages.invalidMonth'),
                400,
            );

        const data = await this.feedingModel
            .findOne({
                minMonth: { $lte: month },
                maxMonth: { $gte: month },
            })
            .lean()
            .exec();

        if (!data)
            throw new AppException(
                this.i18nService.t('messages.documentNotFound'),
                400,
            );

        return this.returnObject.feeding(data, lang);
    }
}
