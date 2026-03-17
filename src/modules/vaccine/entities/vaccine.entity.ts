import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum VaccineType {
    LIVE = 'live',
    INACTIVATED = 'inactivated',
    SUBUNIT = 'subunit',
    TOXOID = 'toxoid',
    MRNA = 'mrna',
}

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Vaccine {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    ageRequired: number; // in weeks

    @Prop({ required: true })
    dose: number;

    @Prop({ required: true, enum: Object.values(VaccineType) })
    vaccineType: VaccineType;

    @Prop()
    description?: string;

    @Prop({ default: false })
    isBooster: boolean;
}

export type VaccineDocument = Vaccine & Document;

export const VaccineSchema = SchemaFactory.createForClass(Vaccine);
VaccineSchema.index({ name: 1, dose: 1 });
