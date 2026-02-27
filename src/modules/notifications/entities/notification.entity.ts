import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Notification {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
    user: string | User;

    @Prop({ type: { ar: String, en: String, _id: false } })
    title: {
        ar: string;
        en: string;
    };

    @Prop({ type: { ar: String, en: String, _id: false } })
    message: {
        ar: string;
        en: string;
    };

    @Prop()
    key: string;

    @Prop({ type: Boolean, default: false })
    read: boolean;

    @Prop({ default: 'active', enum: ['active', 'deleted'] })
    status: string;
}

export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
