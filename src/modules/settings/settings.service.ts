import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Settings } from './entities/settings.entity';
import { Model } from 'mongoose';

@Injectable()
export class SettingsService {
    constructor(
        @InjectModel(Settings.name)
        private readonly settingsModel: Model<Settings>,
    ) {}
}
