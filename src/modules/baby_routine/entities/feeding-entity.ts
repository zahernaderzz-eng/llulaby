import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Feeding {
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
                category: {
                    en: String,
                    ar: String,
                },
                items: [
                    {
                        en: String,
                        ar: String,
                    },
                ],
            },
        ],
        required: true,
    })
    foods: {
        category: { en: string; ar: string };
        items: { en: string; ar: string }[];
    }[];

    @Prop({
        type: [
            {
                en: String,
                ar: String,
            },
        ],
        required: true,
    })
    notes: {
        en: string;
        ar: string;
    }[];
}
export type FeedingDocument = Feeding & Document;

export const FeedingSchema = SchemaFactory.createForClass(Feeding);
