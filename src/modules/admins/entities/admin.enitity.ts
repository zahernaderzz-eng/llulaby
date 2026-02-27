import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Identity } from 'src/modules/identities/entities/identity.entity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Admin {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Identity' })
    identity: string | Identity;

    @Prop()
    name: string;

    @Prop({ default: '' })
    avatar: string;
}

export type AdminDocument = Admin & Document;

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.index({ identity: 1 }, { unique: true });
AdminSchema.index({ role: 1 });
AdminSchema.index({ status: 1 });
