import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import bcrypt from 'bcrypt';
import { Role } from 'src/modules/roles/entities/role.enitity';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Identity {
    @Prop()
    email?: string;

    @Prop()
    phone?: string;

    @Prop()
    password: string;

    @Prop()
    otp?: string;

    @Prop()
    otpExpireAt?: Date;

    @Prop({ default: false })
    canResetPassword: boolean;

    @Prop({ default: false })
    dataCompleted: boolean;

    @Prop({ default: false })
    isVerified: boolean;

    @Prop({ default: 'active', enum: ['active', 'deleted', 'blocked'] })
    status: string;

    @Prop({ default: 'user', enum: ['user', 'admin'] })
    type: string;

    @Prop({ type: Date, expires: 0 })
    expireAt?: Date;

    // admin specific fields

    @Prop({ default: false })
    isSuperAdmin?: boolean;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Role.name })
    role?: string | Role;
}

export type IdentityDocument = Identity & Document;

export const IdentitySchema = SchemaFactory.createForClass(Identity);

IdentitySchema.index({ email: 1 }, { unique: true, sparse: true });
IdentitySchema.index({ phone: 1 }, { unique: true, sparse: true });
IdentitySchema.index({ _id: 1, status: 1, isVerified: 1, dataCompleted: 1 });
IdentitySchema.index(
    { email: 1, status: 1, isVerified: 1, dataCompleted: 1 },
    { unique: true, sparse: true },
);
IdentitySchema.index(
    { phone: 1, status: 1, isVerified: 1, dataCompleted: 1 },
    { unique: true, sparse: true },
);

// virtual realtions to get users/admins information
IdentitySchema.virtual('user', {
    ref: 'User',
    localField: '_id',
    foreignField: 'identity',
    justOne: true,
});

IdentitySchema.virtual('admin', {
    ref: 'Admin',
    localField: '_id',
    foreignField: 'identity',
    justOne: true,
});

// pre save hook to hash the password before saving
IdentitySchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
});

// method to compare passwords with the hashed password
IdentitySchema.methods.comparePassword = async function (
    enteredPassword: string,
) {
    return await bcrypt.compare(enteredPassword, this.password);
};
