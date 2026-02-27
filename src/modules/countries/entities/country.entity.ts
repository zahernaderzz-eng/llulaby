import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Country {
    @Prop({
        type: {
            ar: String,
            en: String,
        },
        _id: false,
    })
    name: {
        ar: string;
        en: string;
    };

    @Prop({ type: String, default: '' })
    image: string;
}

export type CountryDocument = Country & Document;

export const CountrySchema = SchemaFactory.createForClass(Country);
