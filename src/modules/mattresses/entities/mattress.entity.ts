import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MattressDocument = Mattress & Document;

// =====================
// 🟢 Name
// =====================
@Schema({ _id: false })
export class Name {
    @Prop({ required: true })
    en!: string;

    @Prop({ required: true })
    ar!: string;
}

export const NameSchema = SchemaFactory.createForClass(Name);

// =====================
// 🟢 Extra
// =====================
@Schema({ _id: false })
export class Extra {
    @Prop({ required: true })
    en!: string;

    @Prop({ required: true })
    ar!: string;

    @Prop({ required: true })
    price!: number;
}

export const ExtraSchema = SchemaFactory.createForClass(Extra);

// =====================
// 🟢 Product
// =====================
@Schema({ _id: false })
export class Product {
    @Prop({ type: NameSchema, required: true })
    name!: Name;

    @Prop()
    height?: number;

    @Prop()
    type?: string;

    // 🟢 للمراتب (array حسب المقاس)
    @Prop({ type: [Number] })
    pricesArray?: number[];

    // 🟢 للمخدات (map)
    @Prop({ type: Object })
    pricesMap?: Record<string, number>;

    // 🟢 variants (زي الوزن)
    @Prop({ type: Object })
    variants?: Record<string, number>;

    // 🟢 سعر ثابت
    @Prop()
    fixedPrice?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// =====================
// 🟢 Main Schema
// =====================
@Schema({ timestamps: true })
export class Mattress {
    @Prop({ type: NameSchema, required: true })
    company!: Name;

    @Prop({ required: true })
    category!: string; // mattress | accessories

    @Prop({ type: [Number] })
    sizes?: number[];

    @Prop({
        type: {
            en: { type: String },
            ar: { type: String },
        },
    })
    notes?: {
        en: string;
        ar: string;
    };

    @Prop({
        type: {
            frame: { type: ExtraSchema },
            qatar: { type: ExtraSchema },
        },
    })
    extras?: {
        frame?: Extra;
        qatar?: Extra;
    };

    @Prop({ type: [ProductSchema], required: true })
    products!: Product[];
}

export const MattressSchema = SchemaFactory.createForClass(Mattress);
