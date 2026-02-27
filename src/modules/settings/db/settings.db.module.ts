import { MongooseModule } from '@nestjs/mongoose';
import { Settings, SettingsSchema } from '../entities/settings.entity';

export const settingsDbModule = MongooseModule.forFeature([
    { name: Settings.name, schema: SettingsSchema },
]);
