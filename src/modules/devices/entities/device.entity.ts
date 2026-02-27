import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { Identity } from 'src/modules/identities/entities/identity.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Device {
    @Prop()
    fcmToken: string;

    @Prop({ type: String, enum: ['android', 'ios', 'web'] })
    deviceType: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Identity' })
    user: string | Identity;
}

export type DeviceDocument = Device & Document;

export const DeviceSchema = SchemaFactory.createForClass(Device);
