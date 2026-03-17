import { Module } from '@nestjs/common';
import { VaccineController } from './vaccine.controller';
import { VaccineService } from './vaccine.service';
import { vaccineDbModule } from './db/vaccine.db.module';

@Module({
    imports: [vaccineDbModule],
    controllers: [VaccineController],
    providers: [VaccineService],
    exports: [VaccineService, vaccineDbModule],
})
export class VaccineModule {}
