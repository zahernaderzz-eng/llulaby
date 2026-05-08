import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Child } from 'src/modules/children/entities/child.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class IoTReading {
    @Prop({ required: true })
    deviceId: string;

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: Child.name,
        required: false,
    })
    child?: string | Child;

    @Prop({ required: true })
    heartRate: number;

    @Prop({ required: true })
    spo2: number;

    @Prop({ required: true })
    temperature: number;

    @Prop({ default: Date.now })
    timestamp: Date;
}

export type IoTReadingDocument = IoTReading & Document;
export const IoTReadingSchema = SchemaFactory.createForClass(IoTReading);

// Indexes
IoTReadingSchema.index({ deviceId: 1, timestamp: -1 });
IoTReadingSchema.index({ child: 1, timestamp: -1 });
