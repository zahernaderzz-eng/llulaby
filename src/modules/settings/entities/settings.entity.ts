import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Settings {
    @Prop()
    appName: string;
}

export type SettingsDocument = Settings & Document;

export const SettingsSchema = SchemaFactory.createForClass(Settings);
