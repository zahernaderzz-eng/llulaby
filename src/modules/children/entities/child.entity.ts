import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Identity } from 'src/modules/identities/entities/identity.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class PredictionRecord {
    @Prop({ required: true })
    prediction: string;

    @Prop({ required: true })
    confidence: number;

    @Prop({ default: Date.now })
    createdAt: Date;
}

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Child {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: Identity.name,
        required: true,
    })
    identity: string | Identity;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    dateBirth: Date;

    @Prop({ required: true, enum: ['male', 'female'] })
    gender: string;

    @Prop({ type: [PredictionRecord], default: [] })
    predictions: PredictionRecord[];

    @Prop({ default: '' })
    avatar?: string;

    @Prop()
    height?: number;

    @Prop()
    weight?: number;

    @Prop()
    bloodType?: string;
}

export type ChildDocument = Child & Document;
export const ChildSchema = SchemaFactory.createForClass(Child);

ChildSchema.index({ identity: 1 });
