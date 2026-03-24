import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MotorDevelopment {
    @Prop({ required: true })
    minMonth: number;

    @Prop({ required: true })
    maxMonth: number;

    @Prop({
        type: {
            en: String,
            ar: String,
        },
        required: true,
    })
    overview: {
        en: string;
        ar: string;
    };

    @Prop({
        type: [
            {
                en: String,
                ar: String,
            },
        ],
        required: true,
    })
    movements: {
        en: string;
        ar: string;
    }[];
}

export type MotorDevelopmentDocument = MotorDevelopment & Document;

export const MotorDevelopmentSchema =
    SchemaFactory.createForClass(MotorDevelopment);
