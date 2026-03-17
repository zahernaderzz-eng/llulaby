import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Child } from 'src/modules/children/entities/child.entity';
import { Vaccine } from './vaccine.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class ChildVaccine {
    @Prop({ type: Types.ObjectId, ref: Child.name, required: true })
    child: string | Child;

    @Prop({ type: Types.ObjectId, ref: Vaccine.name, required: true })
    vaccine: string | Vaccine;

    @Prop({ default: false })
    isTaken: boolean;

    @Prop()
    takenAt?: Date;

    @Prop({ required: true })
    scheduledDate: Date;

    @Prop()
    notes?: string;
}

export type ChildVaccineDocument = ChildVaccine & Document;

export const ChildVaccineSchema = SchemaFactory.createForClass(ChildVaccine);
ChildVaccineSchema.index({ child: 1, scheduledDate: 1 });
