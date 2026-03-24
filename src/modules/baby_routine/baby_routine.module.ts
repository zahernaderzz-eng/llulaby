import { Module } from '@nestjs/common';
import { BabyRoutineService } from './baby_routine.service';
import { BabyRoutineController } from './baby_routine.controller';
import { babtRoutineDbModule } from './db/babt-routine.db.module';

@Module({
    imports: [babtRoutineDbModule],
    controllers: [BabyRoutineController],
    providers: [BabyRoutineService],
    exports: [BabyRoutineService],
})
export class BabyRoutineModule {}
