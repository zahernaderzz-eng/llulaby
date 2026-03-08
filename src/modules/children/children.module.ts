import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Child, ChildSchema } from './entities/child.entity';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { IdentitiesModule } from '../identities/identities.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Child.name, schema: ChildSchema }]),
        IdentitiesModule,
        UserTokensModule,
    ],
    controllers: [ChildrenController],
    providers: [ChildrenService],
    exports: [ChildrenService],
})
export class ChildrenModule { }
