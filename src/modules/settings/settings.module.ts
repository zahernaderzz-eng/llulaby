import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { settingsDbModule } from './db/settings.db.module';

@Module({
    imports: [settingsDbModule],
    controllers: [SettingsController],
    providers: [SettingsService],
})
export class SettingsModule {}
