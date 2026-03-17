import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Vaccine {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    ageRequired: number; // بالأسابيع

    @Prop({ required: true })
    dose: number;

    @Prop({ required: true })
    vaccineType: string;

    @Prop()
    description?: string;

    @Prop({ default: false })
    repeat: boolean;
}

export type VaccineDocument = Vaccine & Document;

export const VaccineSchema = SchemaFactory.createForClass(Vaccine);
