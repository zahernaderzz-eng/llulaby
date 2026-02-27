import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';
import { Identity } from 'src/modules/identities/entities/identity.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class UserToken {
    @Prop()
    token: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Identity' })
    user: string | Identity;
}

export type UserTokenDocument = UserToken & Document;

export const UserTokenSchema = SchemaFactory.createForClass(UserToken);

UserTokenSchema.index({ token: 1 }, { unique: true });
UserTokenSchema.index({ user: 1 });
UserTokenSchema.index({ user: 1, token: 1 });
