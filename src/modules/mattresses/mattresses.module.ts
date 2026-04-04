import { Module } from '@nestjs/common';
import { MattressesService } from './mattresses.service';
import { MattressesController } from './mattresses.controller';
import { MattressesDbModule } from './db/mattresses.db.module';

@Module({
    imports: [MattressesDbModule],
    controllers: [MattressesController],
    providers: [MattressesService],
})
export class MattressesModule {}
