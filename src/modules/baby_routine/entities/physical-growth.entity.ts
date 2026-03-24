import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class PhysicalGrowth {
    @Prop({ required: true })
    minMonth: number;

    @Prop({ required: true })
    maxMonth: number;

    @Prop({
        type: {
            en: { type: String, required: true },
            ar: { type: String, required: true },
        },
        required: true,
    })
    overview: {
        en: string;
        ar: string;
    };

    @Prop({
        type: {
            en: { type: String, required: true },
            ar: { type: String, required: true },
        },
        required: true,
    })
    weight: {
        en: string;
        ar: string;
    };

    @Prop({
        type: {
            en: { type: String, required: true },
            ar: { type: String, required: true },
        },
        required: true,
    })
    height: {
        en: string;
        ar: string;
    };
}

export type PhysicalGrowthDocument = PhysicalGrowth & Document;
export const PhysicalGrowthSchema =
    SchemaFactory.createForClass(PhysicalGrowth);
