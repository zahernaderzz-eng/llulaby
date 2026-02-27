import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Country } from 'src/modules/countries/entities/country.entity';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { Identity } from 'src/modules/identities/entities/identity.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class User {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'Identity',
        required: false,
    })
    identity: string | Identity;

    @Prop()
    name: string;

    @Prop({ default: '' })
    avatar: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Country.name })
    country: string | Country;

    @Prop()
    bio: string;

    @Prop({ default: true })
    isNotify: boolean;

    @Prop({ default: 0 })
    notificationsCount: number;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ identity: 1 }, { unique: true });
