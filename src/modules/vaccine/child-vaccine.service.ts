import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    ChildVaccine,
    ChildVaccineDocument,
} from './entities/child-vaccine.entity';
import { Vaccine, VaccineDocument } from './entities/vaccine.entity';
import { ChildrenService } from '../children/children.service';
import { ReturnObject } from 'src/common/return-object/return-object';
import { MarkTakenDto } from './dto/mark-taken.dto';

@Injectable()
export class ChildVaccineService {
    constructor(
        @InjectModel(ChildVaccine.name)
        private readonly childVaccineModel: Model<ChildVaccineDocument>,
        @InjectModel(Vaccine.name)
        private readonly vaccineModel: Model<VaccineDocument>,
        @Inject(forwardRef(() => ChildrenService))
        private readonly childrenService: ChildrenService,
        private readonly returnObject: ReturnObject,
    ) { }

    private weeksToMs(weeks: number) {
        return weeks * 7 * 24 * 60 * 60 * 1000;
    }

    async generateForChild(childId: string, dateBirth: Date) {
        const vaccines = await this.vaccineModel.find().lean();

        const docs = vaccines.map((v) => {
            const scheduled = new Date(
                dateBirth.getTime() + this.weeksToMs(v.ageRequired),
            );
            return {
                child: new Types.ObjectId(childId),
                vaccine: new Types.ObjectId((v as any)._id),
                isTaken: false,
                scheduledDate: scheduled,
            };
        });

        // Avoid duplicates: insert those not existing
        const bulk = [] as any[];
        for (const d of docs) {
            const exists = await this.childVaccineModel
                .findOne({ child: d.child, vaccine: d.vaccine })
                .lean();
            if (!exists) bulk.push(d);
        }

        if (bulk.length) {
            await this.childVaccineModel.insertMany(bulk);
        }
    }

    async markTaken(userId: string, dto: MarkTakenDto) {
        const child = await this.childrenService.findOne(userId);
        console.log(child)
        if (!child) throw new NotFoundException('Child not found');

        console.log(dto.vaccineId)
        const childVaccine = await this.childVaccineModel.findOne({
            child: child._id,
            vaccine: new Types.ObjectId(dto.vaccineId)
        });
        console.log(childVaccine)
        if (!childVaccine) throw new NotFoundException('Child vaccine not found');

        childVaccine.isTaken = dto.isTaken;
        await childVaccine.save();

        return childVaccine;
    }

    async getAllForChild(
        userId: string,
        type: 'all' | 'done' | 'upcoming' | 'overdue' | 'missed' = 'all',
    ) {
        const child = await this.childrenService.findOne(userId);
        if (!child) throw new NotFoundException('Child not found');

        const objectId = new Types.ObjectId((child as any)._id);
        const now = new Date();

        const pipeline: any[] = [
            {
                $match: { child: objectId },
            },
            {
                $addFields: {
                    status: {
                        $cond: {
                            if: { $eq: ['$isTaken', true] },
                            then: 'done',
                            else: {
                                $cond: {
                                    if: { $lt: ['$scheduledDate', now] },
                                    then: 'overdue',
                                    else: 'upcoming',
                                },
                            },
                        },
                    },
                },
            },
        ];

        if (type !== 'all') {
            const filterStatus = type === 'missed' ? 'overdue' : type;
            pipeline.push({
                $match: { status: filterStatus },
            });
        }

        pipeline.push(
            // ─── جيب بيانات الطفل ──────────────────────────────────
            {
                $lookup: {
                    from: 'children',
                    localField: 'child',
                    foreignField: '_id',
                    as: 'childData',
                },
            },
            { $unwind: '$childData' },
            // ─── جيب بيانات اللقاح ─────────────────────────────────
            {
                $lookup: {
                    from: 'vaccines',
                    localField: 'vaccine',
                    foreignField: '_id',
                    as: 'vaccineData',
                },
            },
        );

        const data = await this.childVaccineModel.aggregate(pipeline);
        return data;
    }
}
