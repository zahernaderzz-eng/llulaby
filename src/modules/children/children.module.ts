import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Child, ChildSchema } from './entities/child.entity';
import { ChildrenService } from './children.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Child.name, schema: ChildSchema }]),
    ],
    providers: [ChildrenService],
    exports: [ChildrenService],
})
export class ChildrenModule { }
