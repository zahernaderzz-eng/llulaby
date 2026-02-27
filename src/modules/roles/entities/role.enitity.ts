import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Role {
    @Prop({
        type: {
            _id: false,
            ar: String,
            en: String,
        },
    })
    name: {
        ar: string;
        en: string;
    };

    @Prop({ default: false })
    isSuperAdmin: boolean;

    @Prop({ default: 'active', enum: ['active', 'deleted'] })
    status: string;

    @Prop({ type: [String], default: [] })
    permissions: string[];
}

export type RoleDocument = Role & Document;

export const RoleSchema = SchemaFactory.createForClass(Role);
